import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';
import { ConfigService } from '../../../../../core/services/config.service';
import {
  CSV_COLUMN_SEPARATOR_OPTIONS,
  CSV_DECIMAL_SEPARATOR_OPTIONS,
  DEFAULT_SENSOR_DATA_SETTINGS,
  DEFAULT_SURVEY_SETTINGS,
  SENSOR_PARAMETER_DATA_TYPE_OPTIONS,
  SensorParameterDefinition,
  SensorTypeSetting,
  RespondentSensorAssignment,
  SurveySensorDataSettings,
  SurveySettings,
} from '../../../../../domain/models/survey-settings';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { isSelectableSensorTypeCode } from '../../../../../core/utils/sensor-type-filters';
import { START_SURVEY_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';

@Component({
  selector: 'app-survey-settings',
  templateUrl: './survey-settings.component.html',
  styleUrl: './survey-settings.component.scss',
})
export class SurveySettingsComponent implements OnInit, OnDestroy {
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

  constructor(
    @Inject('surveySettingsService')
    private readonly service: SurveySettingsService,
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
    if (this.hasDuplicateParameterNameUnitPairs()) {
      this.showError('surveySettings.sensorData.duplicateNameUnit');
      return;
    }
    this.isSensorSettingsBusy = true;
    // Re-read sensor types before save so Integrations enable/timeout edits are not overwritten.
    this.service
      .getSensorDataSettings()
      .pipe(
        switchMap((latest) =>
          this.service.updateSensorDataSettings({
            mode: this.sensorSettings.mode,
            sensorTypes: latest.sensorTypes,
            parameters: this.sensorSettings.parameters,
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

  addParameter(): void {
    const nextOrder = this.sensorSettings.parameters.length;
    this.sensorSettings = {
      ...this.sensorSettings,
      parameters: [
        ...this.sensorSettings.parameters,
        {
          code: '',
          name: '',
          dataType: 'decimal',
          unit: '',
          required: true,
          active: true,
          displayOrder: nextOrder,
          sources: [],
        },
      ],
    };
  }

  removeParameter(index: number): void {
    this.sensorSettings = {
      ...this.sensorSettings,
      parameters: this.sensorSettings.parameters.filter((_, i) => i !== index),
    };
  }

  isAssignmentTypeActive(sensorTypeCode: string): boolean {
    if (sensorTypeCode === 'manual') {
      return true;
    }
    return this.sensorSettings.sensorTypes.some(
      (sensorType) => sensorType.sensorTypeCode === sensorTypeCode && sensorType.enabled
    );
  }

  hasSource(parameter: SensorParameterDefinition, sensorTypeCode: string): boolean {
    return parameter.sources.some((source) => source.sensorTypeCode === sensorTypeCode);
  }

  toggleSource(parameter: SensorParameterDefinition, sensorTypeCode: string, enabled: boolean): void {
    if (enabled && !this.hasSource(parameter, sensorTypeCode)) {
      parameter.sources = [
        ...parameter.sources,
        {
          sensorTypeCode,
          priorityOrder: parameter.sources.length,
        },
      ];
      return;
    }

    if (!enabled) {
      parameter.sources = parameter.sources.filter(
        (source) => source.sensorTypeCode !== sensorTypeCode
      );
    }
  }

  onLogoSelected(fileList: FileList | null): void {
    const file = fileList?.item(0);
    if (!file || this.isLogoBusy) {
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

  /**
   * A parameter's identity is the (name, unit) pair, not the name alone: two parameters that
   * measure different things in different units (e.g. lux "Light" vs. a boolean "Light" flag)
   * must be distinct definitions. Mirrors the backend's UQ_sensor_parameter_definition_name_unit
   * constraint so admins see a clear error instead of a raw save failure.
   */
  private hasDuplicateParameterNameUnitPairs(): boolean {
    const seen = new Set<string>();
    for (const parameter of this.sensorSettings.parameters) {
      const key = `${parameter.name.trim().toLowerCase()}\u0000${(parameter.unit ?? '').trim().toLowerCase()}`;
      if (seen.has(key)) {
        return true;
      }
      seen.add(key);
    }
    return false;
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
