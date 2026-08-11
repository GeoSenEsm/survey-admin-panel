import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ConfigService } from '../../../../../core/services/config.service';
import {
  CSV_COLUMN_SEPARATOR_OPTIONS,
  CSV_DECIMAL_SEPARATOR_OPTIONS,
  DEFAULT_SENSOR_DATA_SETTINGS,
  DEFAULT_SURVEY_SETTINGS,
  SENSOR_PARAMETER_DATA_TYPE_OPTIONS,
  SensorParameterDefinition,
  SensorParameterSource,
  SensorTypeSetting,
  SurveySensorDataSettings,
  SurveySettings,
} from '../../../../../domain/models/survey-settings';
import { SensorTypeParameter } from '../../../../../domain/models/sensor-profile';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import {
  isSelectableAsParameterSource,
  isSelectableSensorTypeCode,
} from '../../../../../core/utils/sensor-type-filters';
import {
  SENSOR_PROFILE_SERVICE_TOKEN,
  SENSORS_SERVICE_TOKEN,
  START_SURVEY_SERVICE_TOKEN,
  SURVEY_SETTINGS_SERVICE_TOKEN,
} from '../../../../../core/services/injection-tokens';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';

interface AddSourceDraft {
  rawParameterId: string;
}

interface NewParameterDraft {
  code: string;
  name: string;
  dataType: string;
  unit: string;
  required: boolean;
}

interface NewParameterFromRawDraft {
  rawParameterId: string;
  required: boolean;
}

@Component({
  selector: 'app-survey-settings',
  templateUrl: './survey-settings.component.html',
  styleUrl: './survey-settings.component.scss',
})
export class SurveySettingsComponent implements OnInit, OnDestroy {
  private static readonly MAX_LOGO_FILE_SIZE_BYTES = 1024 * 1024;

  readonly columnSeparatorOptions = CSV_COLUMN_SEPARATOR_OPTIONS;
  readonly decimalSeparatorOptions = CSV_DECIMAL_SEPARATOR_OPTIONS;
  readonly dataTypeOptions = SENSOR_PARAMETER_DATA_TYPE_OPTIONS;

  isBusy = false;
  isLogoBusy = false;
  isSensorSettingsBusy = false;
  sensorSettingsLoaded = false;
  settings: SurveySettings = { ...DEFAULT_SURVEY_SETTINGS };
  sensorSettings: SurveySensorDataSettings = { ...DEFAULT_SENSOR_DATA_SETTINGS };

  /**
   * Replacing a logo keeps the same URL (`logo.png`), so without a cache-busting token the
   * browser would keep showing the previous image after a re-upload.
   */
  private logoCacheBustToken = 0;
  /** Shown immediately on file selection, before the upload round-trip resolves. */
  private localLogoPreviewUrl: string | null = null;

  /**
   * Once the initial survey is published, the study is live and sensor data setup (mode and
   * parameter definitions) can no longer be changed — the backend rejects the save either way,
   * this just surfaces it proactively. Active sensor sources are managed on Integrations.
   * Respondent sensor *assignments* are managed on the Sensor devices screen and saved through
   * a separate, always-unlocked call: which physical sensor a respondent has keeps changing
   * throughout a live study.
   */
  sensorDataSetupLocked = false;

  isParameterActionBusy = false;
  newParameterDraft: NewParameterDraft = SurveySettingsComponent.emptyParameterDraft();
  newParameterFromRawDraft: NewParameterFromRawDraft = SurveySettingsComponent.emptyParameterFromRawDraft();
  /** Raw sensor-type parameters from active integrations that have not been promoted into a used parameter yet. */
  unpromotedRawParameters: SensorTypeParameter[] = [];
  private readonly addSourceDrafts = new Map<string, AddSourceDraft>();
  private sensorTypeIdByCode = new Map<string, string>();

  constructor(
    @Inject(SURVEY_SETTINGS_SERVICE_TOKEN)
    private readonly service: SurveySettingsService,
    @Inject(SENSOR_PROFILE_SERVICE_TOKEN)
    private readonly sensorProfileService: SensorProfileService,
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    private readonly configService: ConfigService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    @Inject(START_SURVEY_SERVICE_TOKEN)
    private readonly startSurveyService: StartSurveyService
  ) {}

  get selectableSensorTypes(): SensorTypeSetting[] {
    return this.sensorSettings.sensorTypes.filter(
      (sensorType) =>
        isSelectableSensorTypeCode(sensorType.sensorTypeCode) && sensorType.enabled
    );
  }

  private static emptyParameterDraft(): NewParameterDraft {
    return { code: '', name: '', dataType: 'decimal', unit: '', required: true };
  }

  private static emptyParameterFromRawDraft(): NewParameterFromRawDraft {
    return { rawParameterId: '', required: true };
  }

  get logoPreviewUrl(): string | null {
    if (this.localLogoPreviewUrl) {
      return this.localLogoPreviewUrl;
    }
    return this.settings.logoPath
      ? `${this.configService.apiUrl}${this.settings.logoPath}?v=${this.logoCacheBustToken}`
      : null;
  }

  ngOnInit(): void {
    this.load();
    this.loadSensorDataSettings();
    this.sensorsService.getSensorTypes().subscribe({
      next: (types) => {
        this.sensorTypeIdByCode = new Map(types.map((type) => [type.code, type.id]));
        this.loadUnpromotedRawParameters();
      },
      error: () => this.showError('surveySettings.sensorData.loadError'),
    });
    this.startSurveyService.getState().subscribe({
      next: (state) => (this.sensorDataSetupLocked = state === 'published'),
      error: () => (this.sensorDataSetupLocked = false),
    });
  }

  ngOnDestroy(): void {
    this.clearLocalLogoPreview();
  }

  load(): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.service
      .getSettings()
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (settings) => {
          this.applySettings(settings);
        },
        error: () => this.showError('surveySettings.loadError'),
      });
  }

  loadSensorDataSettings(): void {
    if (this.isSensorSettingsBusy) {
      return;
    }
    this.isSensorSettingsBusy = true;
    this.service
      .getSensorDataSettings()
      .pipe(finalize(() => (this.isSensorSettingsBusy = false)))
      .subscribe({
        next: (settings) => {
          this.sensorSettings = {
            ...settings,
            sensorTypes: [...settings.sensorTypes],
            parameters: this.mergeParametersPreservingUnsavedEdits(settings.parameters),
            assignments: [...settings.assignments],
          };
          this.sensorSettingsLoaded = true;
          this.loadUnpromotedRawParameters();
        },
        error: () => this.showError('surveySettings.sensorData.loadError'),
      });
  }

  /**
   * `createParameter`/`addParameterFromRaw`/`addSource` all reload the full parameter list to
   * pick up server-computed state (wired sources, display order) after their own action — but a
   * wholesale replacement would silently drop an admin's unsaved inline edit (name/dataType/unit/
   * required) to a *different*, not-yet-saved parameter row, since those fields only persist via
   * `saveParameter`. There is no per-row dirty flag, so this keeps the previously-loaded editable
   * fields for any parameter that still exists, and takes everything else (sources, displayOrder)
   * fresh from the server; brand-new parameters are taken as-is.
   */
  private mergeParametersPreservingUnsavedEdits(
    fresh: SensorParameterDefinition[]
  ): SensorParameterDefinition[] {
    const localById = new Map(
      this.sensorSettings.parameters.filter((parameter) => parameter.id).map((parameter) => [parameter.id, parameter])
    );
    return fresh.map((parameter) => {
      const local = parameter.id ? localById.get(parameter.id) : undefined;
      return {
        ...parameter,
        name: local?.name ?? parameter.name,
        dataType: local?.dataType ?? parameter.dataType,
        unit: local?.unit ?? parameter.unit,
        required: local?.required ?? parameter.required,
        sources: [...parameter.sources],
      };
    });
  }

  /**
   * Raw catalog rows from enabled integrations not yet promoted into any used parameter —
   * `availableRawSourcesFor` filters this by (code, unit) to offer fallback sources for an
   * *existing* parameter, where matching another parameter's (name, unit) is exactly what
   * qualifies a row, so no such exclusion is applied here. Deliberately includes `manual`
   * (unlike `selectableSensorTypes`, used for picking a *physical* sensor): manual is a formal,
   * admin-configurable fallback source, not a physical device. Requires both `sensorTypeIdByCode`
   * (from `getSensorTypes`) and `sensorSettings.sensorTypes` (from `getSensorDataSettings`) to be
   * loaded; harmless no-op otherwise since whichever call resolves second re-triggers this.
   */
  loadUnpromotedRawParameters(): void {
    const enabledSensorTypeIds = this.sensorSettings.sensorTypes
      .filter((type) => isSelectableAsParameterSource(type.sensorTypeCode) && type.enabled)
      .map((type) => this.sensorTypeIdFor(type.sensorTypeCode))
      .filter((id): id is string => !!id);
    if (!enabledSensorTypeIds.length) {
      this.unpromotedRawParameters = [];
      return;
    }
    forkJoin(
      enabledSensorTypeIds.map((id) => this.sensorProfileService.listSensorTypeParameters(id))
    ).subscribe({
      next: (results) => {
        this.unpromotedRawParameters = results.flat().filter((raw) => !raw.usedParameterId);
      },
      error: () => this.showError('surveySettings.sensorData.loadError'),
    });
  }

  /**
   * Raw rows eligible to be promoted into a brand-new used parameter — unlike
   * `unpromotedRawParameters`, this excludes rows matching an existing used parameter's
   * (name, unit), mirroring the backend's uniqueness check (`SensorParameterDefinitionValidator`)
   * so a raw parameter that would be rejected on promotion doesn't show up here (it should
   * instead be added as a fallback *source* to that existing parameter via `availableRawSourcesFor`).
   */
  get newParameterRawCandidates(): SensorTypeParameter[] {
    return this.unpromotedRawParameters.filter((raw) => !this.matchesExistingParameter(raw));
  }

  private matchesExistingParameter(raw: SensorTypeParameter): boolean {
    const rawName = SurveySettingsComponent.normalize(raw.name);
    const rawUnit = SurveySettingsComponent.normalize(raw.unit);
    return this.sensorSettings.parameters.some(
      (parameter) =>
        SurveySettingsComponent.normalize(parameter.name) === rawName &&
        SurveySettingsComponent.normalize(parameter.unit) === rawUnit
    );
  }

  private static normalize(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  rawParameterLabel(raw: SensorTypeParameter): string {
    const unitSuffix = raw.unit ? ` (${raw.unit})` : '';
    return `${this.sensorTypeNameFor(raw.sensorTypeCode)} — ${raw.name}${unitSuffix}`;
  }

  /**
   * Every used parameter gets a `manual` fallback wired automatically, so an admin can always
   * collect it by hand even with no physical sensor assigned yet — `manual` is the one sensor
   * type whose raw catalog can legitimately be created on demand for any code, since manual entry
   * has no real hardware to match against (unlike `addSource`, which only ever promotes a raw row
   * that already exists). Best-effort: a failure here doesn't roll back the parameter itself, it
   * just leaves the admin to wire a source by hand.
   */
  private wireManualSource(
    parameter: Pick<SensorParameterDefinition, 'id' | 'code' | 'name' | 'dataType' | 'unit'>
  ): Observable<unknown> {
    const manualSensorTypeId = this.sensorTypeIdByCode.get('manual');
    const parameterId = parameter.id;
    if (!manualSensorTypeId || !parameterId) {
      return of(null);
    }
    return this.sensorProfileService
      .createSensorTypeParameter(manualSensorTypeId, {
        code: parameter.code,
        name: parameter.name,
        dataType: parameter.dataType,
        unit: parameter.unit ?? null,
      })
      .pipe(
        catchError(() =>
          this.sensorProfileService.listSensorTypeParameters(manualSensorTypeId).pipe(
            map((existing) => existing.find((raw) => raw.code === parameter.code)),
            switchMap((existing) =>
              existing ? of(existing) : throwError(() => new Error('manual-source-wire-failed'))
            )
          )
        ),
        switchMap((raw: SensorTypeParameter) =>
          raw.usedParameterId === parameterId
            ? of(raw)
            : this.sensorProfileService.useSensorTypeParameter(manualSensorTypeId, raw.id, {
                usedParameterId: parameterId,
              })
        ),
        catchError(() => of(null))
      );
  }

  saveSensorDataSettings(): void {
    if (this.isSensorSettingsBusy || !this.sensorSettingsLoaded || this.sensorDataSetupLocked) {
      return;
    }
    this.isSensorSettingsBusy = true;
    // Re-read sensor types before save so Integrations enable/timeout edits are not overwritten.
    // NOTE: this no longer saves parameter/source edits made below on this tab — "used sensor
    // data" parameters are now created/edited one at a time via a separate mechanism pending a
    // UI rebuild (see the sensor-data-columns redesign). Only mode changes persist here today.
    this.service
      .getSensorDataSettings()
      .pipe(
        switchMap((latest) =>
          this.service.updateSensorDataSettings({
            mode: this.sensorSettings.mode,
            sensorTypes: latest.sensorTypes,
          })
        ),
        finalize(() => (this.isSensorSettingsBusy = false))
      )
      .subscribe({
        next: (settings) => {
          this.sensorSettings = {
            ...settings,
            parameters: this.mergeParametersPreservingUnsavedEdits(settings.parameters),
            assignments: this.sensorSettings.assignments,
          };
          this.showSuccess('surveySettings.saved');
        },
        error: () => this.showError('surveySettings.sensorData.saveError'),
      });
  }

  onSensorModeChange(checked: boolean): void {
    this.sensorSettings.mode = checked ? 'configured_sensors' : 'no_sensor_data';
  }

  createParameter(): void {
    if (
      this.isParameterActionBusy ||
      this.sensorDataSetupLocked ||
      !this.newParameterDraft.code.trim() ||
      !this.newParameterDraft.name.trim()
    ) {
      return;
    }
    this.isParameterActionBusy = true;
    this.service
      .createSensorParameterDefinition({
        code: this.newParameterDraft.code.trim(),
        name: this.newParameterDraft.name.trim(),
        dataType: this.newParameterDraft.dataType,
        unit: this.newParameterDraft.unit.trim() || null,
        required: this.newParameterDraft.required,
      })
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        next: (created) => {
          this.sensorSettings.parameters = [...this.sensorSettings.parameters, created];
          this.newParameterDraft = SurveySettingsComponent.emptyParameterDraft();
          this.wireManualSource(created).subscribe(() => this.loadSensorDataSettings());
          this.showSuccess('surveySettings.sensorData.parameterCreated');
        },
        error: (err) => this.showApiError(err, 'surveySettings.sensorData.parameterSaveError'),
      });
  }

  /**
   * Promotes a raw, not-yet-used sensor-type parameter straight into a new used parameter in one
   * call (backend creates the `sensor_parameter_definition` and wires this raw row to it), rather
   * than requiring the code/name/dataType/unit to be retyped by hand via the user-defined form.
   */
  addParameterFromRaw(): void {
    const raw = this.newParameterRawCandidates.find(
      (candidate) => candidate.id === this.newParameterFromRawDraft.rawParameterId
    );
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !raw) {
      return;
    }
    this.isParameterActionBusy = true;
    this.sensorProfileService
      .useSensorTypeParameter(raw.sensorTypeId, raw.id, {
        name: raw.name,
        dataType: raw.dataType,
        unit: raw.unit ?? null,
        required: this.newParameterFromRawDraft.required,
      })
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        next: (promoted) => {
          this.newParameterFromRawDraft = SurveySettingsComponent.emptyParameterFromRawDraft();
          const wireManual$ = promoted.usedParameterId
            ? this.wireManualSource({
                id: promoted.usedParameterId,
                code: raw.code,
                name: raw.name,
                dataType: raw.dataType,
                unit: raw.unit ?? undefined,
              })
            : of(null);
          wireManual$.subscribe(() => this.loadSensorDataSettings());
          this.showSuccess('surveySettings.sensorData.parameterCreated');
        },
        error: (err) => this.showApiError(err, 'surveySettings.sensorData.parameterSaveError'),
      });
  }

  saveParameter(parameter: SensorParameterDefinition): void {
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !parameter.id) {
      return;
    }
    this.isParameterActionBusy = true;
    this.service
      .updateSensorParameterDefinition(parameter.id, {
        name: parameter.name,
        dataType: parameter.dataType,
        unit: parameter.unit?.trim() || null,
        required: parameter.required,
        displayOrder: parameter.displayOrder,
      })
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        next: (updated) => {
          this.replaceParameter(updated);
          this.showSuccess('surveySettings.sensorData.parameterSaved');
        },
        error: (err) => this.showApiError(err, 'surveySettings.sensorData.parameterSaveError'),
      });
  }

  /**
   * Hard delete — there is no active/inactive toggle, a parameter is either on the list or gone.
   * The backend rejects this with 409 if sensor readings already exist for it.
   */
  deleteParameter(parameter: SensorParameterDefinition): void {
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !parameter.id) {
      return;
    }
    if (!window.confirm(this.translate.instant('surveySettings.sensorData.removeParameterConfirm', { name: parameter.name }))) {
      return;
    }
    this.isParameterActionBusy = true;
    this.service
      .deleteSensorParameterDefinition(parameter.id)
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        next: () => {
          this.sensorSettings.parameters = this.sensorSettings.parameters.filter(
            (existing) => existing.id !== parameter.id
          );
          this.showSuccess('surveySettings.sensorData.parameterRemoved');
        },
        error: (err) => this.showApiError(err, 'surveySettings.sensorData.parameterRemoveError'),
      });
  }

  sensorTypeIdFor(sensorTypeCode: string): string | undefined {
    return this.sensorTypeIdByCode.get(sensorTypeCode);
  }

  sensorTypeNameFor(sensorTypeCode: string): string {
    const type = this.sensorSettings.sensorTypes.find((t) => t.sensorTypeCode === sensorTypeCode);
    return type?.sensorTypeName || sensorTypeCode;
  }

  /**
   * Raw catalog rows that genuinely report this exact (code, unit) pair and aren't wired to any
   * used parameter yet — the only legitimate candidates for a new source. There is deliberately
   * no free-text "raw code" entry: an admin can only pick a sensor that actually has this reading
   * on its own parameters list, not fabricate one.
   */
  availableRawSourcesFor(parameter: SensorParameterDefinition): SensorTypeParameter[] {
    return this.unpromotedRawParameters.filter(
      (raw) =>
        raw.code === parameter.code &&
        SurveySettingsComponent.normalize(raw.unit) === SurveySettingsComponent.normalize(parameter.unit)
    );
  }

  getAddSourceDraft(parameter: SensorParameterDefinition): AddSourceDraft {
    const key = parameter.id ?? '';
    let draft = this.addSourceDrafts.get(key);
    if (!draft) {
      draft = { rawParameterId: '' };
      this.addSourceDrafts.set(key, draft);
    }
    return draft;
  }

  addSource(parameter: SensorParameterDefinition): void {
    const draft = this.getAddSourceDraft(parameter);
    const raw = this.unpromotedRawParameters.find((candidate) => candidate.id === draft.rawParameterId);
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !parameter.id || !raw) {
      return;
    }
    this.isParameterActionBusy = true;
    this.sensorProfileService
      .useSensorTypeParameter(raw.sensorTypeId, raw.id, { usedParameterId: parameter.id })
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        next: () => {
          this.addSourceDrafts.delete(parameter.id ?? '');
          this.loadSensorDataSettings();
          this.showSuccess('surveySettings.sensorData.sourceAdded');
        },
        error: (err) => this.showApiError(err, 'surveySettings.sensorData.addSourceError'),
      });
  }

  /**
   * This manual removal path never deletes the parameter itself, unlike disabling a sensor type
   * (which unlinks every source it owns and lets the backend delete a parameter left sourceless)
   * — so removing the very last source here would strand the parameter with nothing able to
   * collect it. `parameter.sources` is the real, already-live count.
   */
  canRemoveSource(parameter: SensorParameterDefinition): boolean {
    return parameter.sources.length > 1;
  }

  removeSource(parameter: SensorParameterDefinition, source: SensorParameterSource): void {
    const sensorTypeId = this.sensorTypeIdByCode.get(source.sensorTypeCode);
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !source.id || !sensorTypeId) {
      return;
    }
    if (!this.canRemoveSource(parameter)) {
      this.showError('surveySettings.sensorData.cannotRemoveLastSource');
      return;
    }
    this.isParameterActionBusy = true;
    this.sensorProfileService
      .unuseSensorTypeParameter(sensorTypeId, source.id)
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        next: () => {
          parameter.sources = parameter.sources.filter((existing) => existing.id !== source.id);
          this.showSuccess('surveySettings.sensorData.sourceRemoved');
        },
        error: (err) => this.showApiError(err, 'surveySettings.sensorData.removeSourceError'),
      });
  }

  positionOptionsFor(parameter: SensorParameterDefinition): number[] {
    return Array.from({ length: parameter.sources.length }, (_, i) => i + 1);
  }

  reorderSource(parameter: SensorParameterDefinition, source: SensorParameterSource, newPosition: number): void {
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !parameter.id) {
      return;
    }
    const previous = parameter.sources;
    const oldIndex = previous.indexOf(source);
    const targetIndex = newPosition - 1;
    if (oldIndex === -1 || targetIndex < 0 || targetIndex >= previous.length || targetIndex === oldIndex) {
      return;
    }

    const reordered = [...previous];
    reordered.splice(oldIndex, 1);
    reordered.splice(targetIndex, 0, source);
    parameter.sources = reordered;

    this.isParameterActionBusy = true;
    this.service
      .reorderParameterSources(
        parameter.id,
        reordered.map((existing) => existing.id!)
      )
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        error: () => {
          parameter.sources = previous;
          this.showError('surveySettings.sensorData.reorderSourcesError');
        },
      });
  }

  private replaceParameter(updated: SensorParameterDefinition): void {
    this.sensorSettings.parameters = this.sensorSettings.parameters.map((parameter) =>
      parameter.id === updated.id ? { ...parameter, ...updated, sources: parameter.sources } : parameter
    );
  }

  onLogoSelected(fileList: FileList | null): void {
    const file = fileList?.item(0);
    if (!file || this.isLogoBusy) {
      return;
    }
    if (file.size > SurveySettingsComponent.MAX_LOGO_FILE_SIZE_BYTES) {
      this.showError('surveySettings.logoTooLarge');
      return;
    }
    this.setLocalLogoPreview(file);
    this.isLogoBusy = true;
    this.service
      .uploadLogo(file)
      .pipe(finalize(() => (this.isLogoBusy = false)))
      .subscribe({
        next: (settings) => {
          this.applySettings(settings);
          this.clearLocalLogoPreview();
          this.showSuccess('surveySettings.logoUploaded');
        },
        error: () => {
          this.clearLocalLogoPreview();
          this.showError('surveySettings.logoUploadError');
        },
      });
  }

  onRemoveLogo(): void {
    if (this.isLogoBusy || !this.settings.logoPath) {
      return;
    }
    if (!window.confirm(this.translate.instant('surveySettings.removeLogoConfirm'))) {
      return;
    }
    this.isLogoBusy = true;
    this.service
      .deleteLogo()
      .pipe(finalize(() => (this.isLogoBusy = false)))
      .subscribe({
        next: (settings) => {
          this.applySettings(settings);
          this.showSuccess('surveySettings.logoRemoved');
        },
        error: () => this.showError('surveySettings.logoRemoveError'),
      });
  }

  private applySettings(settings: SurveySettings): void {
    this.settings = { ...settings };
    this.logoCacheBustToken += 1;
  }

  private setLocalLogoPreview(file: File): void {
    this.clearLocalLogoPreview();
    this.localLogoPreviewUrl = URL.createObjectURL(file);
  }

  private clearLocalLogoPreview(): void {
    if (this.localLogoPreviewUrl) {
      URL.revokeObjectURL(this.localLogoPreviewUrl);
      this.localLogoPreviewUrl = null;
    }
  }

  onCalendarToggle(enabled: boolean): void {
    this.save({ ...this.settings, showSendingPolicyCalendar: enabled }, () => {
      this.settings.showSendingPolicyCalendar = !enabled;
    });
  }

  onColumnSeparatorChange(value: string): void {
    if (value === this.settings.csvDecimalSeparator) {
      this.showError('surveySettings.separatorsMustDiffer');
      return;
    }
    this.save({ ...this.settings, csvColumnSeparator: value }, () => {
      /* revert handled via reload of previous value in save error path */
    });
  }

  onDecimalSeparatorChange(value: string): void {
    if (value === this.settings.csvColumnSeparator) {
      this.showError('surveySettings.separatorsMustDiffer');
      return;
    }
    this.save({ ...this.settings, csvDecimalSeparator: value });
  }

  private save(
    payload: SurveySettings,
    onError?: () => void
  ): void {
    if (this.isBusy) {
      onError?.();
      return;
    }

    const previous = { ...this.settings };
    this.settings = { ...payload };
    this.isBusy = true;
    this.service
      .updateSettings(payload)
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (settings) => {
          this.settings = { ...settings };
          this.showSuccess('surveySettings.saved');
        },
        error: () => {
          this.settings = previous;
          onError?.();
          this.showError('surveySettings.saveError');
        },
      });
  }

  private showError(key: string): void {
    this.snackbar.open(
      this.translate.instant(key),
      this.translate.instant('surveySettings.ok')
    );
  }

  /**
   * The backend rejects some parameter writes (e.g. a duplicate name+unit pair) with a plain-text
   * 400 body explaining exactly why — surface that instead of a generic message when present, since
   * a bare "could not save" gives no clue that the name/unit is already used by another parameter.
   */
  private showApiError(err: unknown, fallbackKey: string): void {
    const backendMessage = (err as { error?: unknown })?.error;
    const message =
      typeof backendMessage === 'string' && backendMessage.trim()
        ? backendMessage
        : this.translate.instant(fallbackKey);
    this.snackbar.open(message, this.translate.instant('surveySettings.ok'));
  }

  private showSuccess(key: string): void {
    this.snackbar.open(
      this.translate.instant(key),
      this.translate.instant('surveySettings.ok'),
      { duration: 3000 }
    );
  }
}
