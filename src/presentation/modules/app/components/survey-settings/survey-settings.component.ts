import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, map, of, switchMap, throwError } from 'rxjs';
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
  RespondentSensorAssignment,
  SurveySensorDataSettings,
  SurveySettings,
} from '../../../../../domain/models/survey-settings';
import { SensorTypeParameter } from '../../../../../domain/models/sensor-profile';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { isSelectableSensorTypeCode } from '../../../../../core/utils/sensor-type-filters';
import {
  SENSOR_PROFILE_SERVICE_TOKEN,
  SENSORS_SERVICE_TOKEN,
  START_SURVEY_SERVICE_TOKEN,
} from '../../../../../core/services/injection-tokens';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';

interface AddSourceDraft {
  sensorTypeId: string;
  code: string;
}

interface NewParameterDraft {
  code: string;
  name: string;
  dataType: string;
  unit: string;
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
  isAssignmentsSaving = false;
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
   * Respondent sensor *assignments* are saved through a separate, always-unlocked call: which
   * physical sensor a respondent has keeps changing throughout a live study.
   */
  sensorDataSetupLocked = false;

  /** Hidden by default: only active parameters clutter the editing view. */
  showInactiveParameters = false;
  isParameterActionBusy = false;
  newParameterDraft: NewParameterDraft = SurveySettingsComponent.emptyParameterDraft();
  private readonly addSourceDrafts = new Map<string, AddSourceDraft>();
  private sensorTypeIdByCode = new Map<string, string>();

  constructor(
    @Inject('surveySettingsService')
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

  get visibleParameters(): SensorParameterDefinition[] {
    return this.sensorSettings.parameters.filter(
      (parameter) => this.showInactiveParameters || parameter.active
    );
  }

  private static emptyParameterDraft(): NewParameterDraft {
    return { code: '', name: '', dataType: 'decimal', unit: '', required: true };
  }

  get activeAssignments(): RespondentSensorAssignment[] {
    return this.sensorSettings.assignments.filter((assignment) =>
      this.isAssignmentTypeActive(assignment.sensorTypeCode)
    );
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
            parameters: settings.parameters.map((parameter) => ({
              ...parameter,
              sources: [...parameter.sources],
            })),
            assignments: [...settings.assignments],
          };
          this.sensorSettingsLoaded = true;
        },
        error: () => this.showError('surveySettings.sensorData.loadError'),
      });
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
            assignments: this.sensorSettings.assignments,
          };
          this.showSuccess('surveySettings.saved');
        },
        error: () => this.showError('surveySettings.sensorData.saveError'),
      });
  }

  /**
   * Deliberately not guarded by `sensorDataSetupLocked`: see that field's doc comment for why
   * assignments stay editable after the initial survey is published.
   */
  saveAssignments(): void {
    if (this.isAssignmentsSaving) {
      return;
    }
    this.isAssignmentsSaving = true;
    this.service
      .updateAssignments(this.sensorSettings.assignments)
      .pipe(finalize(() => (this.isAssignmentsSaving = false)))
      .subscribe({
        next: (settings) => {
          // Keep any unsaved local setup edits; those go through saveSensorDataSettings().
          this.sensorSettings = {
            ...this.sensorSettings,
            assignments: settings.assignments,
          };
          this.showSuccess('surveySettings.saved');
        },
        error: () => this.showError('surveySettings.sensorData.saveError'),
      });
  }

  isAssignmentTypeActive(sensorTypeCode: string): boolean {
    if (sensorTypeCode === 'manual') {
      return true;
    }
    return this.sensorSettings.sensorTypes.some(
      (sensorType) => sensorType.sensorTypeCode === sensorTypeCode && sensorType.enabled
    );
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
          this.showSuccess('surveySettings.sensorData.parameterCreated');
        },
        error: () => this.showError('surveySettings.sensorData.parameterSaveError'),
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
        active: parameter.active,
        displayOrder: parameter.displayOrder,
      })
      .pipe(finalize(() => (this.isParameterActionBusy = false)))
      .subscribe({
        next: (updated) => {
          this.replaceParameter(updated);
          this.showSuccess('surveySettings.sensorData.parameterSaved');
        },
        error: () => this.showError('surveySettings.sensorData.parameterSaveError'),
      });
  }

  sensorTypeIdFor(sensorTypeCode: string): string | undefined {
    return this.sensorTypeIdByCode.get(sensorTypeCode);
  }

  sensorTypeNameFor(sensorTypeCode: string): string {
    const type = this.sensorSettings.sensorTypes.find((t) => t.sensorTypeCode === sensorTypeCode);
    return type?.sensorTypeName || sensorTypeCode;
  }

  /** Active, enabled sensor types not already a source of this parameter. */
  availableSensorTypesFor(parameter: SensorParameterDefinition): SensorTypeSetting[] {
    const used = new Set(parameter.sources.map((source) => source.sensorTypeCode));
    return this.selectableSensorTypes.filter((type) => !used.has(type.sensorTypeCode));
  }

  getAddSourceDraft(parameter: SensorParameterDefinition): AddSourceDraft {
    const key = parameter.id ?? '';
    let draft = this.addSourceDrafts.get(key);
    if (!draft) {
      draft = { sensorTypeId: '', code: parameter.code };
      this.addSourceDrafts.set(key, draft);
    }
    return draft;
  }

  addSource(parameter: SensorParameterDefinition): void {
    const draft = this.getAddSourceDraft(parameter);
    const rawCode = draft.code.trim();
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !parameter.id || !draft.sensorTypeId || !rawCode) {
      return;
    }
    const sensorTypeId = draft.sensorTypeId;
    this.isParameterActionBusy = true;
    this.sensorProfileService
      .createSensorTypeParameter(sensorTypeId, {
        code: rawCode,
        name: parameter.name,
        dataType: parameter.dataType,
        unit: parameter.unit ?? null,
      })
      .pipe(
        catchError(() =>
          this.sensorProfileService.listSensorTypeParameters(sensorTypeId).pipe(
            map((existing) => existing.find((raw) => raw.code === rawCode)),
            switchMap((existing) => {
              if (!existing) {
                return throwError(() => new Error('sensor-type-parameter-not-found'));
              }
              if (existing.usedParameterId && existing.usedParameterId !== parameter.id) {
                return throwError(() => new Error('sensor-type-parameter-already-used'));
              }
              return of(existing);
            })
          )
        ),
        switchMap((raw: SensorTypeParameter) =>
          raw.usedParameterId === parameter.id
            ? of(raw)
            : this.sensorProfileService.useSensorTypeParameter(sensorTypeId, raw.id, {
                usedParameterId: parameter.id,
              })
        ),
        finalize(() => (this.isParameterActionBusy = false))
      )
      .subscribe({
        next: () => {
          this.addSourceDrafts.delete(parameter.id ?? '');
          this.loadSensorDataSettings();
          this.showSuccess('surveySettings.sensorData.sourceAdded');
        },
        error: () => this.showError('surveySettings.sensorData.addSourceError'),
      });
  }

  removeSource(parameter: SensorParameterDefinition, source: SensorParameterSource): void {
    const sensorTypeId = this.sensorTypeIdByCode.get(source.sensorTypeCode);
    if (this.isParameterActionBusy || this.sensorDataSetupLocked || !source.id || !sensorTypeId) {
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
        error: () => this.showError('surveySettings.sensorData.removeSourceError'),
      });
  }

  moveSource(parameter: SensorParameterDefinition, index: number, direction: -1 | 1): void {
    const targetIndex = index + direction;
    if (
      this.isParameterActionBusy ||
      this.sensorDataSetupLocked ||
      !parameter.id ||
      targetIndex < 0 ||
      targetIndex >= parameter.sources.length
    ) {
      return;
    }
    const previous = parameter.sources;
    const reordered = [...parameter.sources];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    parameter.sources = reordered;

    this.isParameterActionBusy = true;
    this.service
      .reorderParameterSources(
        parameter.id,
        reordered.map((source) => source.id!)
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

  private showSuccess(key: string): void {
    this.snackbar.open(
      this.translate.instant(key),
      this.translate.instant('surveySettings.ok'),
      { duration: 3000 }
    );
  }
}
