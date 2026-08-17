import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
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
        'uploadLogo',
        'deleteLogo',
        'watchSettings',
        'createSensorParameterDefinition',
        'updateSensorParameterDefinition',
        'deleteSensorParameterDefinition',
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

  it('saves the mode through the settings endpoint, preserving latest sensor types', () => {
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
      })
    );
    settingsService.updateSensorDataSettings.and.returnValue(
      of({
        ...component.sensorSettings,
        sensorTypes: latestTypes,
      })
    );

    component.saveSensorDataSettings();

    const [payload] = settingsService.updateSensorDataSettings.calls.mostRecent().args;
    expect(payload).toEqual({ mode: 'configured_sensors', sensorTypes: latestTypes });
  });

  describe('used sensor data parameters', () => {
    it('createParameter() posts the draft and reloads to pick up the backend-wired manual source', () => {
      component.newParameterDraft = {
        code: 'battery',
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
      };
      const created = {
        id: 'p1',
        code: 'battery',
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
        displayOrder: 0,
        sources: [{ sensorTypeCode: 'manual', rawParameterCode: 'battery' }],
      };
      settingsService.createSensorParameterDefinition.and.returnValue(of(created));
      settingsService.getSensorDataSettings.and.returnValue(
        of({ mode: 'configured_sensors', sensorTypes: [], parameters: [created] })
      );

      component.createParameter();

      expect(settingsService.createSensorParameterDefinition).toHaveBeenCalledWith({
        code: 'battery',
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
      });
      // The backend wires the `manual` source automatically now; the component just reloads
      // the list rather than orchestrating that itself.
      expect(component.sensorSettings.parameters).toContain(created);
      expect(component.newParameterDraft.code).toBe('');
    });

    it('does not create a parameter without a code or name', () => {
      component.newParameterDraft = { code: '', name: '', dataType: 'decimal', unit: '' };
      component.createParameter();
      expect(settingsService.createSensorParameterDefinition).not.toHaveBeenCalled();
    });

    it('saveParameter() persists edits while keeping local sources', () => {
      const source = { id: 's1', sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature' };
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temp',
        dataType: 'decimal',
        unit: 'C',
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
        displayOrder: 0,
      });
      expect(component.sensorSettings.parameters[0].sources).toEqual([source]);
    });

    it('availableRawSourcesFor() only lists raw parameters matching this parameter\'s code and unit', () => {
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        displayOrder: 0,
        sources: [],
      };
      const matching = {
        id: 'raw1',
        sensorTypeId: 'st1',
        sensorTypeCode: 'kestrel',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        usedParameterId: null,
        usedParameterCode: null,
      };
      const differentUnit = { ...matching, id: 'raw2', unit: 'F' };
      const differentCode = { ...matching, id: 'raw3', code: 'humidity' };
      component.unpromotedRawParameters = [matching, differentUnit, differentCode];

      expect(component.availableRawSourcesFor(parameter)).toEqual([matching]);
    });

    it('availableRawSourcesFor() includes a raw parameter that collides with an existing used parameter, so a detached source can be re-wired', () => {
      const parameter = {
        id: 'p1',
        code: 'humidity',
        name: 'Humidity',
        dataType: 'decimal',
        unit: '%',
        displayOrder: 0,
        sources: [],
      };
      const detachedRaw = {
        id: 'raw1',
        sensorTypeId: 'st1',
        sensorTypeCode: 'inkbird',
        code: 'humidity',
        name: 'Humidity',
        dataType: 'decimal',
        unit: '%',
        usedParameterId: null,
        usedParameterCode: null,
      };
      component.sensorSettings.parameters = [parameter];
      component.unpromotedRawParameters = [detachedRaw];

      expect(component.availableRawSourcesFor(parameter)).toEqual([detachedRaw]);
    });

    it('newParameterRawCandidates excludes a raw parameter matching an existing used parameter\'s name and unit', () => {
      const parameter = {
        id: 'p1',
        code: 'humidity',
        name: 'Humidity',
        dataType: 'decimal',
        unit: '%',
        displayOrder: 0,
        sources: [],
      };
      const collidingRaw = {
        id: 'raw1',
        sensorTypeId: 'st1',
        sensorTypeCode: 'inkbird',
        code: 'humidity',
        name: 'Humidity',
        dataType: 'decimal',
        unit: '%',
        usedParameterId: null,
        usedParameterCode: null,
      };
      component.sensorSettings.parameters = [parameter];
      component.unpromotedRawParameters = [collidingRaw];

      expect(component.newParameterRawCandidates).toEqual([]);
    });

    it('addSource() promotes the matching raw parameter without creating anything new', () => {
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        displayOrder: 0,
        sources: [],
      };
      component.sensorSettings.parameters = [parameter];
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
      };
      component.unpromotedRawParameters = [rawParameter];
      component.getAddSourceDraft(parameter).rawParameterId = 'raw1';
      sensorProfileService.useSensorTypeParameter.and.returnValue(
        of({ ...rawParameter, usedParameterId: 'p1' })
      );
      settingsService.getSensorDataSettings.and.returnValue(
        of({ mode: 'configured_sensors', sensorTypes: [], parameters: [] })
      );

      component.addSource(parameter);

      expect(sensorProfileService.useSensorTypeParameter).toHaveBeenCalledWith('sensor-type-1', 'raw1', {
        usedParameterId: 'p1',
      });
      expect(sensorProfileService.createSensorTypeParameter).not.toHaveBeenCalled();
    });

    it('addParameterFromRaw() promotes an unpromoted raw parameter into a brand new used parameter', () => {
      const raw = {
        id: 'raw1',
        sensorTypeId: 'sensor-type-1',
        sensorTypeCode: 'kestrel',
        code: 'battery',
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
        usedParameterId: null,
        usedParameterCode: null,
      };
      component.unpromotedRawParameters = [raw];
      component.newParameterFromRawDraft = { rawParameterId: 'raw1' };
      sensorProfileService.useSensorTypeParameter.and.returnValue(
        of({ ...raw, usedParameterId: 'new-param-1' })
      );
      settingsService.getSensorDataSettings.and.returnValue(
        of({ mode: 'configured_sensors', sensorTypes: [], parameters: [] })
      );

      component.addParameterFromRaw();

      expect(sensorProfileService.useSensorTypeParameter).toHaveBeenCalledWith('sensor-type-1', 'raw1', {
        name: 'Battery',
        dataType: 'decimal',
        unit: '%',
      });
      expect(component.newParameterFromRawDraft.rawParameterId).toBe('');
    });

    it('removeSource() unuses the raw parameter and drops it locally', () => {
      const source = { id: 's1', sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature' };
      const other = { id: 's2', sensorTypeCode: 'manual', rawParameterCode: 'temperature' };
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        displayOrder: 0,
        sources: [source, other],
      };
      (component as unknown as { sensorTypeIdByCode: Map<string, string> }).sensorTypeIdByCode = new Map([
        ['xiaomi', 'sensor-type-xiaomi'],
      ]);
      sensorProfileService.unuseSensorTypeParameter.and.returnValue(of({ ...source, usedParameterId: null } as any));

      component.removeSource(parameter, source);

      expect(sensorProfileService.unuseSensorTypeParameter).toHaveBeenCalledWith('sensor-type-xiaomi', 's1');
      expect(parameter.sources).toEqual([other]);
    });

    it('removeSource() refuses to remove the only remaining source', () => {
      const source = { id: 's1', sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature' };
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        displayOrder: 0,
        sources: [source],
      };
      (component as unknown as { sensorTypeIdByCode: Map<string, string> }).sensorTypeIdByCode = new Map([
        ['xiaomi', 'sensor-type-xiaomi'],
      ]);

      component.removeSource(parameter, source);

      expect(sensorProfileService.unuseSensorTypeParameter).not.toHaveBeenCalled();
      expect(parameter.sources).toEqual([source]);
    });

    it('removeSource() refuses to remove the manual fallback even when another source exists', () => {
      const manualSource = { id: 's1', sensorTypeCode: 'manual', rawParameterCode: 'temperature' };
      const other = { id: 's2', sensorTypeCode: 'xiaomi', rawParameterCode: 'temperature' };
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        displayOrder: 0,
        sources: [manualSource, other],
      };
      (component as unknown as { sensorTypeIdByCode: Map<string, string> }).sensorTypeIdByCode = new Map([
        ['manual', 'sensor-type-manual'],
      ]);

      component.removeSource(parameter, manualSource);

      expect(sensorProfileService.unuseSensorTypeParameter).not.toHaveBeenCalled();
      expect(parameter.sources).toEqual([manualSource, other]);
    });

    it('deleteParameter() removes it locally after confirmation', () => {
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        displayOrder: 0,
        sources: [],
      };
      component.sensorSettings.parameters = [parameter];
      spyOn(window, 'confirm').and.returnValue(true);
      settingsService.deleteSensorParameterDefinition.and.returnValue(of(undefined));

      component.deleteParameter(parameter);

      expect(settingsService.deleteSensorParameterDefinition).toHaveBeenCalledWith('p1');
      expect(component.sensorSettings.parameters).toEqual([]);
    });

    it('deleteParameter() does nothing when the confirmation is declined', () => {
      const parameter = {
        id: 'p1',
        code: 'temperature',
        name: 'Temperature',
        dataType: 'decimal',
        unit: 'C',
        displayOrder: 0,
        sources: [],
      };
      component.sensorSettings.parameters = [parameter];
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteParameter(parameter);

      expect(settingsService.deleteSensorParameterDefinition).not.toHaveBeenCalled();
      expect(component.sensorSettings.parameters).toEqual([parameter]);
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
