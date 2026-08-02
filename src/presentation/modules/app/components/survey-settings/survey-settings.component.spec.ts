import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ConfigService } from '../../../../../core/services/config.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { SurveySettingsComponent } from './survey-settings.component';

describe('SurveySettingsComponent', () => {
  let settingsService: jasmine.SpyObj<SurveySettingsService>;
  let component: SurveySettingsComponent;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SurveySettingsService>(
      'SurveySettingsService',
      [
        'getSettings',
        'updateSettings',
        'getSensorDataSettings',
        'updateSensorDataSettings',
        'watchSettings',
      ],
      {
        cachedSettings: {
          showSendingPolicyCalendar: true,
          csvColumnSeparator: ',',
          csvDecimalSeparator: '.',
          logoPath: null,
        },
      }
    );
    component = new SurveySettingsComponent(
      settingsService,
      {} as unknown as ConfigService,
      { open: jasmine.createSpy('open') } as unknown as MatSnackBar,
      {
        instant: (key: string) => key,
      } as unknown as TranslateService
    );
  });

  it('renders explicit integration mode labels', () => {
    expect(component.integrationModeLabel('profile')).toContain('profile');
    expect(component.integrationModeLabel('native')).toContain('native');
    expect(component.integrationModeLabel(undefined)).toContain('none');
  });

  it('saves assignment edits through canonical sensor settings', () => {
    component.sensorSettingsLoaded = true;
    component.sensorSettings.assignments = [
      {
        respondentId: 'respondent-1',
        sensorTypeCode: 'custom',
        enabled: false,
        priorityOrder: 0,
      },
    ];
    component.sensorSettings.assignments[0].enabled = true;
    settingsService.updateSensorDataSettings.and.returnValue(
      of(component.sensorSettings)
    );

    component.saveSensorDataSettings();

    expect(settingsService.updateSensorDataSettings).toHaveBeenCalledWith(
      jasmine.objectContaining({
        assignments: [
          jasmine.objectContaining({
            respondentId: 'respondent-1',
            enabled: true,
          }),
        ],
      })
    );
  });
});
