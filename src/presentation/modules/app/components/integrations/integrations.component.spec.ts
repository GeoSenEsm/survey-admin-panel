import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { IntegrationsComponent } from './integrations.component';

describe('IntegrationsComponent', () => {
  let settingsService: jasmine.SpyObj<SurveySettingsService>;
  let sensorProfileService: jasmine.SpyObj<SensorProfileService>;
  let startSurveyService: jasmine.SpyObj<StartSurveyService>;
  let component: IntegrationsComponent;

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
      { cachedSettings: undefined }
    );
    sensorProfileService = jasmine.createSpyObj<SensorProfileService>('SensorProfileService', [
      'getCapabilities',
      'listSensorTypes',
      'createSensorType',
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
    sensorProfileService.listTemplates.and.returnValue(of([]));
    startSurveyService = jasmine.createSpyObj<StartSurveyService>('StartSurveyService', [
      'getState',
    ]);
    startSurveyService.getState.and.returnValue(of('not_created'));
    component = new IntegrationsComponent(
      settingsService,
      sensorProfileService,
      startSurveyService,
      { open: jasmine.createSpy('open') } as unknown as MatSnackBar,
      { instant: (key: string) => key } as unknown as TranslateService
    );
  });

  it('lists only selectable sensor types', () => {
    component.sensorSettings.sensorTypes = [
      { sensorTypeCode: 'none', enabled: true, connectionTimeoutSeconds: 10, displayOrder: 0 },
      { sensorTypeCode: 'manual', enabled: true, connectionTimeoutSeconds: 10, displayOrder: 1 },
      {
        sensorTypeCode: 'xiaomi',
        sensorTypeName: 'Xiaomi',
        enabled: true,
        connectionTimeoutSeconds: 15,
        displayOrder: 2,
      },
    ];

    expect(component.selectableSensorTypes.map((t) => t.sensorTypeCode)).toEqual(['xiaomi']);
  });

  it('parametersFor() lists the names of parameters sourced from a sensor type', () => {
    component.sensorSettings.parameters = [
      {
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        required: false,
        displayOrder: 0,
        sources: [{ sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature', priorityOrder: 0 }],
      },
      {
        code: 'humidity',
        name: 'Humidity',
        dataType: 'decimal',
        unit: '%',
        required: false,
        displayOrder: 1,
        sources: [
          { sensorTypeCode: 'xiaomi', rawParameterCode: 'humidity', priorityOrder: 0 },
          { sensorTypeCode: 'kestrel', rawParameterCode: 'humidity', priorityOrder: 1 },
        ],
      },
    ];

    expect(component.parametersFor('xiaomi')).toEqual(['Temperature', 'Humidity']);
    expect(component.parametersFor('kestrel')).toEqual(['Humidity']);
    expect(component.parametersFor('manual')).toEqual([]);
  });

  it('sets the locked flag once startSurveyService reports the initial survey as published', () => {
    const state$ = new Subject<'not_created' | 'craeted' | 'published'>();
    startSurveyService.getState.and.returnValue(state$);
    settingsService.getSensorDataSettings.and.returnValue(new Subject());

    component.ngOnInit();
    expect(component.sensorDataSetupLocked).toBeFalse();

    state$.next('published');
    expect(component.sensorDataSetupLocked).toBeTrue();
  });

  it('does not save while locked, not yet loaded, or already busy', () => {
    component.sensorDataSetupLocked = true;
    component.loaded = true;
    component.save();
    expect(settingsService.getSensorDataSettings).not.toHaveBeenCalled();

    component.sensorDataSetupLocked = false;
    component.loaded = false;
    component.save();
    expect(settingsService.getSensorDataSettings).not.toHaveBeenCalled();

    component.loaded = true;
    component.isBusy = true;
    component.save();
    expect(settingsService.getSensorDataSettings).not.toHaveBeenCalled();
  });

  describe('onSensorTypeEnabledChange', () => {
    it('strips the disabled sensor type from every parameter source', () => {
      const xiaomi = {
        sensorTypeCode: 'xiaomi',
        enabled: true,
        connectionTimeoutSeconds: 10,
        displayOrder: 0,
      };
      component.sensorSettings.parameters = [
        {
          code: 'temperature',
          name: 'Temperature',
          dataType: 'decimal',
          unit: 'C',
          required: false,
            displayOrder: 0,
          sources: [
            { sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature', priorityOrder: 0 },
            { sensorTypeCode: 'kestrel', rawParameterCode: 'temperature', priorityOrder: 1 },
          ],
        },
      ];

      component.onSensorTypeEnabledChange(xiaomi, false);

      expect(xiaomi.enabled).toBeFalse();
      expect(component.sensorSettings.parameters[0].sources).toEqual([
        { sensorTypeCode: 'kestrel', rawParameterCode: 'temperature', priorityOrder: 1 },
      ]);
    });

    it('does not mutate respondent assignments: those are only edited on Survey Settings', () => {
      const kestrel = {
        sensorTypeCode: 'kestrel',
        enabled: true,
        connectionTimeoutSeconds: 10,
        displayOrder: 0,
      };
      component.sensorSettings.assignments = [
        { respondentId: 'r1', sensorTypeCode: 'kestrel', enabled: true, priorityOrder: 0 },
      ];

      component.onSensorTypeEnabledChange(kestrel, false);

      expect(component.sensorSettings.assignments[0].enabled).toBeTrue();
    });
  });

  it('save() sends only mode and the local sensor types, and does not touch assignments', () => {
    component.loaded = true;
    component.sensorSettings.sensorTypes = [
      { sensorTypeCode: 'kestrel', enabled: false, connectionTimeoutSeconds: 10, displayOrder: 0 },
    ];
    const localAssignments = [
      { respondentId: 'r1', sensorTypeCode: 'kestrel', enabled: true, priorityOrder: 0 },
    ];
    component.sensorSettings.assignments = localAssignments;

    settingsService.getSensorDataSettings.and.returnValue(
      of({
        mode: 'configured_sensors',
        sensorTypes: [],
        parameters: [],
        assignments: [],
      })
    );
    settingsService.updateSensorDataSettings.and.returnValue(
      of({
        mode: 'configured_sensors',
        sensorTypes: component.sensorSettings.sensorTypes,
        parameters: [],
        assignments: [],
      })
    );

    component.save();

    const [payload] = settingsService.updateSensorDataSettings.calls.mostRecent().args;
    expect(payload).toEqual({ mode: 'configured_sensors', sensorTypes: component.sensorSettings.sensorTypes });
    expect(component.sensorSettings.assignments).toBe(localAssignments);
  });

  describe('sensor templates', () => {
    it('exposes only templates that are not yet installed', () => {
      component.templates = [
        { code: 'xiaomi', name: 'Xiaomi', parameterCodes: ['temperature'], installed: true },
        { code: 'kestrel', name: 'Kestrel', parameterCodes: ['temperature'], installed: false },
      ];

      expect(component.availableTemplates.map((t) => t.code)).toEqual(['kestrel']);
    });

    it('activateTemplate() installs the template, then enables it and moves it to the top of the list', () => {
      sensorProfileService.installTemplate.and.returnValue(
        of({ id: '1', code: 'kestrel', name: 'Kestrel', integrationMode: 'profile' })
      );
      settingsService.getSensorDataSettings.and.returnValue(
        of({
          mode: 'no_sensor_data',
          sensorTypes: [
            { sensorTypeCode: 'manual', enabled: true, connectionTimeoutSeconds: 30, displayOrder: 3 },
            {
              sensorTypeCode: 'kestrel',
              sensorTypeName: 'Kestrel',
              enabled: false,
              connectionTimeoutSeconds: 30,
              displayOrder: 99,
            },
          ],
          parameters: [],
          assignments: [],
        })
      );

      component.activateTemplate({
        code: 'kestrel',
        name: 'Kestrel',
        parameterCodes: ['temperature'],
        installed: false,
      });

      expect(sensorProfileService.installTemplate).toHaveBeenCalledWith('kestrel');
      expect(sensorProfileService.listTemplates).toHaveBeenCalledTimes(1);
      expect(settingsService.getSensorDataSettings).toHaveBeenCalled();
      expect(component.isInstalling).toBeFalse();
      expect(component.sensorSettings.sensorTypes[0].sensorTypeCode).toBe('kestrel');
      expect(component.sensorSettings.sensorTypes[0].enabled).toBeTrue();
    });

    it('does not activate while already activating or locked', () => {
      component.isInstalling = true;
      component.activateTemplate({
        code: 'kestrel',
        name: 'Kestrel',
        parameterCodes: [],
        installed: false,
      });
      expect(sensorProfileService.installTemplate).not.toHaveBeenCalled();

      component.isInstalling = false;
      component.sensorDataSetupLocked = true;
      component.activateTemplate({
        code: 'kestrel',
        name: 'Kestrel',
        parameterCodes: [],
        installed: false,
      });
      expect(sensorProfileService.installTemplate).not.toHaveBeenCalled();
    });
  });
});
