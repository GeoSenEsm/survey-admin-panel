import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { ConfigService } from '../../../../../core/services/config.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { SurveySettings } from '../../../../../domain/models/survey-settings';
import { SurveySettingsComponent } from './survey-settings.component';

describe('SurveySettingsComponent', () => {
  let settingsService: jasmine.SpyObj<SurveySettingsService>;
  let sensorProfileService: jasmine.SpyObj<SensorProfileService>;
  let sensorsService: jasmine.SpyObj<SensorsService>;
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
        'createSensorParameterDefinition',
        'updateSensorParameterDefinition',
        'reorderParameterSources',
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
    sensorProfileService = jasmine.createSpyObj<SensorProfileService>('SensorProfileService', [
      'getCapabilities',
      'listSensorTypes',
      'createSensorType',
      'deleteSensorType',
      'listSensorTypeParameters',
      'createSensorTypeParameter',
      'updateSensorTypeParameter',
      'deleteSensorTypeParameter',
      'useSensorTypeParameter',
      'unuseSensorTypeParameter',
      'listTemplates',
      'installTemplate',
      'listRevisions',
      'getRevision',
      'createDraft',
      'updateDraft',
      'validateDraft',
      'publish',
      'rollback',
      'putDeviceSecret',
    ]);
    sensorsService = jasmine.createSpyObj<SensorsService>('SensorsService', [
      'getSensors',
      'getSensorTypes',
      'addSensors',
      'updateSensor',
      'assignRespondent',
      'deleteSensor',
    ]);
    sensorsService.getSensorTypes.and.returnValue(of([]));
    startSurveyService = jasmine.createSpyObj<StartSurveyService>('StartSurveyService', [
      'getState',
    ]);
    startSurveyService.getState.and.returnValue(of('not_created'));
    component = new SurveySettingsComponent(
      settingsService,
      sensorProfileService,
      sensorsService,
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

  it('saves the mode through the settings endpoint, preserving latest sensor types and excluding assignments/parameters', () => {
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
    expect(payload).toEqual({ mode: 'configured_sensors', sensorTypes: latestTypes });
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

  describe('used sensor data parameters', () => {
    it('createParameter() posts the draft and appends the result', () => {
      component.newParameterDraft = {
        code: 'battery',
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
        required: false,
      };
      const created = {
        id: 'p1',
        code: 'battery',
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
        required: false,
        active: true,
        displayOrder: 0,
        sources: [],
      };
      settingsService.createSensorParameterDefinition.and.returnValue(of(created));

      component.createParameter();

      expect(settingsService.createSensorParameterDefinition).toHaveBeenCalledWith({
        code: 'battery',
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
        required: false,
      });
      expect(component.sensorSettings.parameters).toContain(created);
      expect(component.newParameterDraft.code).toBe('');
    });

    it('does not create a parameter without a code or name', () => {
      component.newParameterDraft = { code: '', name: '', dataType: 'decimal', unit: '', required: true };
      component.createParameter();
      expect(settingsService.createSensorParameterDefinition).not.toHaveBeenCalled();
    });

    it('saveParameter() persists edits while keeping local sources', () => {
      const source = { id: 's1', sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature', priorityOrder: 0 };
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temp',
        dataType: 'decimal',
        unit: 'C',
        required: true,
        active: true,
        displayOrder: 0,
        sources: [source],
      };
      component.sensorSettings.parameters = [parameter];
      settingsService.updateSensorParameterDefinition.and.returnValue(
        of({ ...parameter, name: 'Temperature', sources: [] })
      );

      component.saveParameter(parameter);

      expect(settingsService.updateSensorParameterDefinition).toHaveBeenCalledWith('p1', {
        name: 'Temp',
        dataType: 'decimal',
        unit: 'C',
        required: true,
        active: true,
        displayOrder: 0,
      });
      expect(component.sensorSettings.parameters[0].sources).toEqual([source]);
    });

    it('addSource() creates a raw parameter under the chosen sensor type and links it', () => {
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        required: true,
        active: true,
        displayOrder: 0,
        sources: [],
      };
      component.sensorSettings.parameters = [parameter];
      component.getAddSourceDraft(parameter).sensorTypeId = 'sensor-type-1';
      component.getAddSourceDraft(parameter).code = 'temperature';
      const rawParameter = {
        id: 'raw1',
        sensorTypeId: 'sensor-type-1',
        sensorTypeCode: 'kestrel',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        usedParameterId: null,
        usedParameterCode: null,
        priorityOrder: 0,
      };
      sensorProfileService.createSensorTypeParameter.and.returnValue(of(rawParameter));
      sensorProfileService.useSensorTypeParameter.and.returnValue(
        of({ ...rawParameter, usedParameterId: 'p1', priorityOrder: 0 })
      );
      settingsService.getSensorDataSettings.and.returnValue(
        of({ mode: 'configured_sensors', sensorTypes: [], parameters: [], assignments: [] })
      );

      component.addSource(parameter);

      expect(sensorProfileService.createSensorTypeParameter).toHaveBeenCalledWith('sensor-type-1', {
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
      });
      expect(sensorProfileService.useSensorTypeParameter).toHaveBeenCalledWith('sensor-type-1', 'raw1', {
        usedParameterId: 'p1',
      });
    });

    it('removeSource() unuses the raw parameter and drops it locally', () => {
      const source = { id: 's1', sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature', priorityOrder: 0 };
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        required: true,
        active: true,
        displayOrder: 0,
        sources: [source],
      };
      (component as unknown as { sensorTypeIdByCode: Map<string, string> }).sensorTypeIdByCode = new Map([
        ['xiaomi', 'sensor-type-xiaomi'],
      ]);
      sensorProfileService.unuseSensorTypeParameter.and.returnValue(of({ ...source, usedParameterId: null } as any));

      component.removeSource(parameter, source);

      expect(sensorProfileService.unuseSensorTypeParameter).toHaveBeenCalledWith('sensor-type-xiaomi', 's1');
      expect(parameter.sources).toEqual([]);
    });

    it('moveSource() swaps priority optimistically and reverts on error', () => {
      const first = { id: 's1', sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature', priorityOrder: 0 };
      const second = { id: 's2', sensorTypeCode: 'kestrel', rawParameterCode: 'temperature', priorityOrder: 1 };
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        required: true,
        active: true,
        displayOrder: 0,
        sources: [first, second],
      };
      settingsService.reorderParameterSources.and.returnValue(throwError(() => new Error('fail')));

      component.moveSource(parameter, 0, 1);

      expect(settingsService.reorderParameterSources).toHaveBeenCalledWith('p1', ['s2', 's1']);
      // Reverted after the server call failed.
      expect(parameter.sources).toEqual([first, second]);
    });
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
