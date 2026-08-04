import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';
import { START_SURVEY_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { isSelectableSensorTypeCode } from '../../../../../core/utils/sensor-type-filters';
import { sensorTypeImageUrl } from '../../../../../core/utils/sensor-type-images';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import {
  DEFAULT_SENSOR_DATA_SETTINGS,
  SensorTypeSetting,
  SurveySensorDataSettings,
} from '../../../../../domain/models/survey-settings';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.scss',
})
export class IntegrationsComponent implements OnInit {
  sensorSettings: SurveySensorDataSettings = { ...DEFAULT_SENSOR_DATA_SETTINGS };
  isBusy = false;
  loaded = false;
  sensorDataSetupLocked = false;

  constructor(
    @Inject('surveySettingsService')
    private readonly surveySettingsService: SurveySettingsService,
    @Inject(START_SURVEY_SERVICE_TOKEN)
    private readonly startSurveyService: StartSurveyService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {}

  get selectableSensorTypes(): SensorTypeSetting[] {
    return this.sensorSettings.sensorTypes.filter((sensorType) =>
      isSelectableSensorTypeCode(sensorType.sensorTypeCode)
    );
  }

  ngOnInit(): void {
    this.load();
    this.startSurveyService.getState().subscribe({
      next: (state) => (this.sensorDataSetupLocked = state === 'published'),
      error: () => (this.sensorDataSetupLocked = false),
    });
  }

  load(): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.surveySettingsService
      .getSensorDataSettings()
      .pipe(finalize(() => (this.isBusy = false)))
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
          this.loaded = true;
        },
        error: () => this.showMessage('integrations.loadError'),
      });
  }

  onSensorTypeEnabledChange(sensorType: SensorTypeSetting, enabled: boolean): void {
    sensorType.enabled = enabled;
    if (!enabled) {
      // Respondent assignments for this type are managed separately, on the Survey Settings ->
      // Sensor Data tab (dedicated updateAssignments endpoint) — this page never sends
      // assignments, so it must not mutate them locally either.
      this.sensorSettings.parameters.forEach((parameter) => {
        parameter.sources = parameter.sources.filter(
          (source) => source.sensorTypeCode !== sensorType.sensorTypeCode
        );
      });
    }
  }

  save(): void {
    if (this.isBusy || !this.loaded || this.sensorDataSetupLocked) {
      return;
    }
    this.isBusy = true;
    const disabledCodes = new Set(
      this.sensorSettings.sensorTypes
        .filter((sensorType) => !sensorType.enabled)
        .map((sensorType) => sensorType.sensorTypeCode)
    );
    this.surveySettingsService
      .getSensorDataSettings()
      .pipe(
        switchMap((latest) =>
          this.surveySettingsService.updateSensorDataSettings({
            mode: latest.mode,
            sensorTypes: this.sensorSettings.sensorTypes,
            parameters: latest.parameters.map((parameter) => ({
              ...parameter,
              sources: parameter.sources.filter(
                (source) => !disabledCodes.has(source.sensorTypeCode)
              ),
            })),
          })
        ),
        finalize(() => (this.isBusy = false))
      )
      .subscribe({
        next: (settings) => {
          this.sensorSettings = {
            ...settings,
            assignments: this.sensorSettings.assignments,
          };
          this.showMessage('integrations.saved');
        },
        error: () => this.showMessage('integrations.saveError'),
      });
  }

  integrationModeLabel(integrationMode: string | undefined): string {
    return `surveySettings.sensorData.integrationModes.${integrationMode ?? 'none'}`;
  }

  readonly sensorImage = sensorTypeImageUrl;

  private showMessage(key: string, params?: Record<string, unknown>): void {
    this.snackbar.open(
      this.translate.instant(key, params),
      this.translate.instant('integrations.ok'),
      { duration: 3000 }
    );
  }
}
