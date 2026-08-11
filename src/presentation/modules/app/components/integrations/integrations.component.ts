import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';
import {
  SENSOR_PROFILE_SERVICE_TOKEN,
  START_SURVEY_SERVICE_TOKEN,
  SURVEY_SETTINGS_SERVICE_TOKEN,
} from '../../../../../core/services/injection-tokens';
import { isSelectableSensorTypeCode } from '../../../../../core/utils/sensor-type-filters';
import { sensorTypeImageUrl } from '../../../../../core/utils/sensor-type-images';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { SensorProfileTemplate } from '../../../../../domain/models/sensor-profile';
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
  templates: SensorProfileTemplate[] = [];
  templatesLoaded = false;
  isInstalling = false;

  constructor(
    @Inject(SURVEY_SETTINGS_SERVICE_TOKEN)
    private readonly surveySettingsService: SurveySettingsService,
    @Inject(SENSOR_PROFILE_SERVICE_TOKEN)
    private readonly sensorProfileService: SensorProfileService,
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

  get availableTemplates(): SensorProfileTemplate[] {
    return this.templates.filter((template) => !template.installed);
  }

  ngOnInit(): void {
    this.load();
    this.loadTemplates();
    this.startSurveyService.getState().subscribe({
      next: (state) => (this.sensorDataSetupLocked = state === 'published'),
      error: () => (this.sensorDataSetupLocked = false),
    });
  }

  loadTemplates(): void {
    this.sensorProfileService.listTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.templatesLoaded = true;
      },
      error: () => this.showMessage('integrations.templatesLoadError'),
    });
  }

  activateTemplate(template: SensorProfileTemplate): void {
    if (this.isInstalling || this.sensorDataSetupLocked) {
      return;
    }
    this.isInstalling = true;
    this.sensorProfileService
      .installTemplate(template.code)
      .pipe(finalize(() => (this.isInstalling = false)))
      .subscribe({
        next: () => {
          this.loadTemplates();
          this.load(() => this.enableAndPromote(template.code));
          this.showMessage('integrations.templateActivated', { name: template.name });
        },
        error: () =>
          this.showMessage('integrations.templateActivateError', { name: template.name }),
      });
  }

  load(onLoaded?: () => void): void {
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
          onLoaded?.();
        },
        error: () => this.showMessage('integrations.loadError'),
      });
  }

  /**
   * Just-activated sensor types default to disabled with a low display priority (see
   * `SensorGattProfileServiceImpl#createSensorType`); surface the one the admin just activated
   * at the top, already switched on, so its timeout can be reviewed before saving.
   */
  private enableAndPromote(sensorTypeCode: string): void {
    const sensorTypes = this.sensorSettings.sensorTypes;
    const index = sensorTypes.findIndex((type) => type.sensorTypeCode === sensorTypeCode);
    if (index < 0) {
      return;
    }
    const [activated] = sensorTypes.splice(index, 1);
    activated.enabled = true;
    sensorTypes.unshift(activated);
  }

  onSensorTypeEnabledChange(sensorType: SensorTypeSetting, enabled: boolean): void {
    sensorType.enabled = enabled;
    if (!enabled) {
      // Respondent assignments (which physical device a respondent has) are a separate concern
      // from parameter source priority and are saved through their own dedicated
      // updateAssignments endpoint — this page never sends assignments, so it must not mutate
      // them locally either. The backend detaches (and, if left sourceless, deletes) this sensor
      // type's parameter sources itself on save.
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
    this.surveySettingsService
      .getSensorDataSettings()
      .pipe(
        switchMap((latest) =>
          this.surveySettingsService.updateSensorDataSettings({
            mode: latest.mode,
            sensorTypes: this.sensorSettings.sensorTypes,
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

  parametersFor(sensorTypeCode: string): string[] {
    return this.sensorSettings.parameters
      .filter((parameter) =>
        parameter.sources.some((source) => source.sensorTypeCode === sensorTypeCode)
      )
      .map((parameter) => parameter.name);
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
