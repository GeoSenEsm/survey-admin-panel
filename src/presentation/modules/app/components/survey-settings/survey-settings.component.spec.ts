import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { ConfigService } from '../../../../../core/services/config.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { SurveySettings } from '../../../../../domain/models/survey-settings';
import { SurveySettingsComponent } from './survey-settings.component';

describe('SurveySettingsComponent', () => {
  let settingsService: jasmine.SpyObj<SurveySettingsService>;
  let startSurveyService: jasmine.SpyObj<StartSurveyService>;
  let component: SurveySettingsComponent;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SurveySettingsService>(
      'SurveySettingsService',
      [
        'getSettings',
        'updateSettings',
        'getSensorDataSettings',
        'updateSensorDataSettings',
        'updateAssignments',
        'uploadLogo',
        'deleteLogo',
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
    startSurveyService = jasmine.createSpyObj<StartSurveyService>('StartSurveyService', [
      'getState',
    ]);
    startSurveyService.getState.and.returnValue(of('not_created'));
    component = new SurveySettingsComponent(
      settingsService,
      { apiUrl: 'https://api.test' } as unknown as ConfigService,
      { open: jasmine.createSpy('open') } as unknown as MatSnackBar,
      {
        instant: (key: string) => key,
      } as unknown as TranslateService,
      startSurveyService
    );
  });

  it('lists only enabled selectable sensor types for parameter sources', () => {
    component.sensorSettings.sensorTypes = [
      {
        sensorTypeCode: 'none',
        enabled: false,
        connectionTimeoutSeconds: 10,
        displayOrder: 0,
      },
      {
        sensorTypeCode: 'manual',
        enabled: true,
        connectionTimeoutSeconds: 10,
        displayOrder: 1,
      },
      {
        sensorTypeCode: 'xiaomi',
        sensorTypeName: 'Xiaomi',
        enabled: true,
        connectionTimeoutSeconds: 15,
        displayOrder: 2,
      },
      {
        sensorTypeCode: 'kestrel',
        sensorTypeName: 'Kestrel',
        enabled: false,
        connectionTimeoutSeconds: 15,
        displayOrder: 3,
      },
    ];

    expect(component.selectableSensorTypes.map((t) => t.sensorTypeCode)).toEqual(['xiaomi']);
  });

  it('lists only assignments for active sensor types', () => {
    component.sensorSettings.sensorTypes = [
      {
        sensorTypeCode: 'xiaomi',
        enabled: true,
        connectionTimeoutSeconds: 15,
        displayOrder: 0,
      },
      {
        sensorTypeCode: 'kestrel',
        enabled: false,
        connectionTimeoutSeconds: 15,
        displayOrder: 1,
      },
    ];
    component.sensorSettings.assignments = [
      {
        respondentId: 'r1',
        sensorTypeCode: 'xiaomi',
        enabled: true,
        priorityOrder: 0,
      },
      {
        respondentId: 'r2',
        sensorTypeCode: 'kestrel',
        enabled: true,
        priorityOrder: 0,
      },
      {
        respondentId: 'r3',
        sensorTypeCode: 'manual',
        enabled: true,
        priorityOrder: 0,
      },
    ];

    expect(component.activeAssignments.map((a) => a.sensorTypeCode)).toEqual([
      'xiaomi',
      'manual',
    ]);
  });

  it('locks sensor data setup and rejects saves once the initial survey is published', () => {
    startSurveyService.getState.and.returnValue(of('published'));

    component.sensorDataSetupLocked = true;
    component.sensorSettingsLoaded = true;
    component.saveSensorDataSettings();

    expect(settingsService.updateSensorDataSettings).not.toHaveBeenCalled();
  });

  it('sets the locked flag once startSurveyService reports the initial survey as published', () => {
    const state$ = new Subject<'not_created' | 'craeted' | 'published'>();
    startSurveyService.getState.and.returnValue(state$);
    settingsService.getSettings.and.returnValue(new Subject());
    settingsService.getSensorDataSettings.and.returnValue(new Subject());

    component.ngOnInit();
    expect(component.sensorDataSetupLocked).toBeFalse();

    state$.next('published');
    expect(component.sensorDataSetupLocked).toBeTrue();
  });

  it('saves the mode and parameters through the settings endpoint, preserving latest sensor types and excluding assignments', () => {
    component.sensorSettingsLoaded = true;
    component.sensorSettings.mode = 'configured_sensors';
    component.sensorSettings.sensorTypes = [
      {
        sensorTypeCode: 'xiaomi',
        enabled: false,
        connectionTimeoutSeconds: 10,
        displayOrder: 0,
      },
    ];
    component.sensorSettings.assignments = [
      {
        respondentId: 'respondent-1',
        sensorTypeCode: 'custom',
        enabled: false,
        priorityOrder: 0,
      },
    ];
    const localAssignments = component.sensorSettings.assignments;
    const latestTypes = [
      {
        sensorTypeCode: 'xiaomi',
        enabled: true,
        connectionTimeoutSeconds: 20,
        displayOrder: 0,
      },
    ];
    settingsService.getSensorDataSettings.and.returnValue(
      of({
        mode: 'no_sensor_data',
        sensorTypes: latestTypes,
        parameters: [],
        assignments: [],
      })
    );
    settingsService.updateSensorDataSettings.and.returnValue(
      of({
        ...component.sensorSettings,
        sensorTypes: latestTypes,
        assignments: [
          {
            respondentId: 'respondent-from-server',
            sensorTypeCode: 'custom',
            enabled: true,
            priorityOrder: 1,
          },
        ],
      })
    );

    component.saveSensorDataSettings();

    const [payload] = settingsService.updateSensorDataSettings.calls.mostRecent().args;
    expect(Object.keys(payload)).not.toContain('assignments');
    expect(payload.sensorTypes).toEqual(latestTypes);
    expect(component.sensorSettings.assignments).toBe(localAssignments);
  });

  it('saves assignment edits through the dedicated assignments endpoint, even once locked', () => {
    component.sensorDataSetupLocked = true;
    component.sensorSettings.mode = 'configured_sensors';
    component.sensorSettings.assignments = [
      {
        respondentId: 'respondent-1',
        sensorTypeCode: 'custom',
        enabled: false,
        priorityOrder: 0,
      },
    ];
    component.sensorSettings.assignments[0].enabled = true;
    settingsService.updateAssignments.and.returnValue(
      of({
        mode: 'no_sensor_data',
        sensorTypes: [],
        parameters: [],
        assignments: [
          {
            respondentId: 'respondent-1',
            sensorTypeCode: 'custom',
            enabled: true,
            priorityOrder: 0,
          },
        ],
      })
    );

    component.saveAssignments();

    expect(settingsService.updateAssignments).toHaveBeenCalledWith([
      jasmine.objectContaining({ respondentId: 'respondent-1', enabled: true }),
    ]);
    expect(settingsService.updateSensorDataSettings).not.toHaveBeenCalled();
    expect(component.sensorSettings.mode).toBe('configured_sensors');
    expect(component.sensorSettings.assignments[0].enabled).toBeTrue();
  });

  it('has no logo preview when no logo has been uploaded', () => {
    expect(component.logoPreviewUrl).toBeNull();
  });

  it('shows an instant local preview as soon as a logo file is selected, before the upload resolves', () => {
    const upload$ = new Subject<SurveySettings>();
    settingsService.uploadLogo.and.returnValue(upload$);
    const file = new File(['content'], 'logo.png', { type: 'image/png' });

    component.onLogoSelected({
      item: () => file,
      length: 1,
    } as unknown as FileList);

    expect(component.logoPreviewUrl).toMatch(/^blob:/);
    expect(component.isLogoBusy).toBeTrue();
  });

  it('switches to a cache-busted server URL once the upload resolves, so a same-named replacement is not served stale', () => {
    const firstUpload$ = new Subject<SurveySettings>();
    settingsService.uploadLogo.and.returnValue(firstUpload$);
    const file = new File(['content'], 'logo.png', { type: 'image/png' });

    component.onLogoSelected({ item: () => file, length: 1 } as unknown as FileList);
    firstUpload$.next({
      showSendingPolicyCalendar: true,
      csvColumnSeparator: ',',
      csvDecimalSeparator: '.',
      logoPath: '/uploads/survey_settings/logo.png',
    });
    firstUpload$.complete();

    const firstPreviewUrl = component.logoPreviewUrl;
    expect(firstPreviewUrl).toMatch(
      /^https:\/\/api\.test\/uploads\/survey_settings\/logo\.png\?v=\d+$/
    );
    expect(component.isLogoBusy).toBeFalse();

    const secondUpload$ = new Subject<SurveySettings>();
    settingsService.uploadLogo.and.returnValue(secondUpload$);
    component.onLogoSelected({ item: () => file, length: 1 } as unknown as FileList);
    secondUpload$.next({
      showSendingPolicyCalendar: true,
      csvColumnSeparator: ',',
      csvDecimalSeparator: '.',
      logoPath: '/uploads/survey_settings/logo.png',
    });
    secondUpload$.complete();

    expect(component.logoPreviewUrl).not.toBe(firstPreviewUrl);
  });
});
