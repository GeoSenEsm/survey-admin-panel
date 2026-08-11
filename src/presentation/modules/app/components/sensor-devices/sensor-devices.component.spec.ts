import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { SensorDevicesComponent } from './sensor-devices.component';

describe('SensorDevicesComponent', () => {
  let sensorsService: jasmine.SpyObj<SensorsService>;
  let settingsService: jasmine.SpyObj<SurveySettingsService>;
  let respondentDataService: jasmine.SpyObj<RespondentDataService>;
  let component: SensorDevicesComponent;

  beforeEach(() => {
    sensorsService = jasmine.createSpyObj<SensorsService>('SensorsService', [
      'getSensors',
      'getSensorTypes',
      'addSensors',
      'updateSensor',
      'assignRespondent',
      'deleteSensor',
    ]);
    sensorsService.getSensors.and.returnValue(of([]));
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
      ]
    );
    respondentDataService = jasmine.createSpyObj<RespondentDataService>(
      'RespondentDataService',
      ['getRespondents']
    );
    respondentDataService.getRespondents.and.returnValue(of([]));
    component = new SensorDevicesComponent(
      sensorsService,
      settingsService,
      respondentDataService,
      {} as unknown as MatDialog,
      { open: jasmine.createSpy('open') } as unknown as MatSnackBar,
      { instant: (key: string) => key } as unknown as TranslateService,
      {} as unknown as CsvExportService
    );
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

  it('saves assignment edits through the dedicated assignments endpoint', () => {
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
    expect(component.sensorSettings.assignments[0].enabled).toBeTrue();
  });
});
