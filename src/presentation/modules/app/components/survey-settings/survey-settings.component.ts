import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { ConfigService } from '../../../../../core/services/config.service';
import {
  CSV_COLUMN_SEPARATOR_OPTIONS,
  CSV_DECIMAL_SEPARATOR_OPTIONS,
  DEFAULT_SENSOR_DATA_SETTINGS,
  DEFAULT_SURVEY_SETTINGS,
  SensorParameterDefinition,
  SensorTypeSetting,
  SurveySensorDataSettings,
  SurveySettings,
} from '../../../../../domain/models/survey-settings';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';

@Component({
  selector: 'app-survey-settings',
  templateUrl: './survey-settings.component.html',
  styleUrl: './survey-settings.component.scss',
})
export class SurveySettingsComponent implements OnInit {
  readonly columnSeparatorOptions = CSV_COLUMN_SEPARATOR_OPTIONS;
  readonly decimalSeparatorOptions = CSV_DECIMAL_SEPARATOR_OPTIONS;

  isBusy = false;
  isLogoBusy = false;
  isSensorSettingsBusy = false;
  sensorSettingsLoaded = false;
  settings: SurveySettings = { ...DEFAULT_SURVEY_SETTINGS };
  sensorSettings: SurveySensorDataSettings = { ...DEFAULT_SENSOR_DATA_SETTINGS };

  constructor(
    @Inject('surveySettingsService')
    private readonly service: SurveySettingsService,
    private readonly configService: ConfigService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {}

  get logoPreviewUrl(): string | null {
    return this.settings.logoPath
      ? this.configService.apiUrl + this.settings.logoPath
      : null;
  }

  ngOnInit(): void {
    this.load();
    this.loadSensorDataSettings();
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
          this.settings = { ...settings };
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
    if (this.isSensorSettingsBusy || !this.sensorSettingsLoaded) {
      return;
    }
    if (this.hasDuplicateParameterNameUnitPairs()) {
      this.showError('surveySettings.sensorData.duplicateNameUnit');
      return;
    }
    this.isSensorSettingsBusy = true;
    this.service
      .updateSensorDataSettings(this.sensorSettings)
      .pipe(finalize(() => (this.isSensorSettingsBusy = false)))
      .subscribe({
        next: (settings) => {
          this.sensorSettings = settings;
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

  onSensorTypeEnabledChange(sensorType: SensorTypeSetting, enabled: boolean): void {
    sensorType.enabled = enabled;
    if (!enabled) {
      this.sensorSettings.parameters.forEach((parameter) => {
        parameter.sources = parameter.sources.filter(
          (source) => source.sensorTypeCode !== sensorType.sensorTypeCode
        );
      });
    }
  }

  integrationModeLabel(integrationMode: string | undefined): string {
    return `surveySettings.sensorData.integrationModes.${integrationMode ?? 'none'}`;
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
    this.isLogoBusy = true;
    this.service
      .uploadLogo(file)
      .pipe(finalize(() => (this.isLogoBusy = false)))
      .subscribe({
        next: (settings) => {
          this.settings = { ...settings };
          this.showSuccess('surveySettings.logoUploaded');
        },
        error: () => this.showError('surveySettings.logoUploadError'),
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
          this.settings = { ...settings };
          this.showSuccess('surveySettings.logoRemoved');
        },
        error: () => this.showError('surveySettings.logoRemoveError'),
      });
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
