import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { IntegrationsComponent } from './integrations.component';

describe('IntegrationsComponent', () => {
  let settingsService: jasmine.SpyObj<SurveySettingsService>;
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
    startSurveyService = jasmine.createSpyObj<StartSurveyService>('StartSurveyService', [
      'getState',
    ]);
    startSurveyService.getState.and.returnValue(of('not_created'));
    component = new IntegrationsComponent(
      settingsService,
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
          active: true,
          displayOrder: 0,
          sources: [
            { sensorTypeCode: 'xiaomi', priorityOrder: 0 },
            { sensorTypeCode: 'kestrel', priorityOrder: 1 },
          ],
        },
      ];

      component.onSensorTypeEnabledChange(xiaomi, false);

      expect(xiaomi.enabled).toBeFalse();
      expect(component.sensorSettings.parameters[0].sources).toEqual([
        { sensorTypeCode: 'kestrel', priorityOrder: 1 },
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

  it('save() sends the local sensor types and strips disabled-type sources from the latest parameters', () => {
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
        parameters: [
          {
            code: 'temperature',
            name: 'Temperature',
            dataType: 'decimal',
            unit: 'C',
            required: false,
            active: true,
            displayOrder: 0,
            sources: [
              { sensorTypeCode: 'kestrel', priorityOrder: 0 },
              { sensorTypeCode: 'xiaomi', priorityOrder: 1 },
            ],
          },
        ],
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
    expect(payload.sensorTypes).toBe(component.sensorSettings.sensorTypes);
    expect(payload.parameters[0].sources).toEqual([{ sensorTypeCode: 'xiaomi', priorityOrder: 1 }]);
    expect(component.sensorSettings.assignments).toBe(localAssignments);
  });
});
