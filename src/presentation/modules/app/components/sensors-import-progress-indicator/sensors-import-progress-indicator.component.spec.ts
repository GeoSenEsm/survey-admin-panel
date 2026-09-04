import { MatDialogRef } from '@angular/material/dialog';
import { Papa } from 'ngx-papaparse';
import { of } from 'rxjs';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { DEFAULT_SURVEY_SETTINGS } from '../../../../../domain/models/survey-settings';
import { SensorTypeDto } from '../../../../../domain/models/sensors-dtos';
import {
  OnRepetition,
  SensorsImportProgressIndicatorComponent,
} from './sensors-import-progress-indicator.component';

function fileSelectionEvent(csv: string): Event {
  const file = new File([csv], 'sensors.csv', { type: 'text/csv' });
  return { target: { files: [file] } } as unknown as Event;
}

describe('SensorsImportProgressIndicatorComponent', () => {
  let sensorsService: jasmine.SpyObj<SensorsService>;
  let surveySettingsService: jasmine.SpyObj<SurveySettingsService>;
  let component: SensorsImportProgressIndicatorComponent;
  const sensorTypes: SensorTypeDto[] = [
    { id: 'type-xiaomi', code: 'xiaomi', name: 'Xiaomi' },
    { id: 'type-kestrel', code: 'kestrel', name: 'Kestrel' },
  ];

  beforeEach(() => {
    sensorsService = jasmine.createSpyObj<SensorsService>('SensorsService', [
      'getSensors',
      'getSensorTypes',
      'addSensors',
      'updateSensor',
      'assignRespondent',
      'deleteSensor',
    ]);
    sensorsService.getSensorTypes.and.returnValue(of(sensorTypes));
    surveySettingsService = jasmine.createSpyObj<SurveySettingsService>('SurveySettingsService', [
      'getSettings',
    ]);
    surveySettingsService.getSettings.and.returnValue(of(DEFAULT_SURVEY_SETTINGS));

    component = new SensorsImportProgressIndicatorComponent(
      sensorsService,
      { fileSelectionEvent: fileSelectionEvent(''), currentData: [], reloadCallback: () => {} },
      { close: jasmine.createSpy('close') } as unknown as MatDialogRef<SensorsImportProgressIndicatorComponent>,
      new Papa(),
      surveySettingsService
    );
  });

  it('resolves sensorTypeId from the CSV sensorTypeName column, case- and whitespace-insensitively', async () => {
    const csv = 'sensorId,sensorTypeName,sensorMac\nsensor-1, Xiaomi ,AA:BB:CC:DD:EE:FF\n';
    const rows = await component.readDataToSubmit(fileSelectionEvent(csv));

    expect(rows).toEqual([
      { sensorId: 'sensor-1', sensorMac: 'AA:BB:CC:DD:EE:FF', sensorTypeId: 'type-xiaomi' },
    ]);
  });

  it('normalizes a dash-separated MAC to the colon format the backend requires', async () => {
    const csv = 'sensorId,sensorTypeName,sensorMac\nsensor-1,Xiaomi,aa-bb-cc-dd-ee-ff\n';
    const rows = await component.readDataToSubmit(fileSelectionEvent(csv));

    expect(rows[0].sensorMac).toEqual('AA:BB:CC:DD:EE:FF');
  });

  it('leaves sensorTypeId undefined when the CSV sensor type name matches no known type', async () => {
    const csv = 'sensorId,sensorTypeName,sensorMac\nsensor-1,Not A Real Type,AA:BB:CC:DD:EE:FF\n';
    const rows = await component.readDataToSubmit(fileSelectionEvent(csv));

    expect(rows[0].sensorTypeId).toBeUndefined();
  });

  it('fails validation instead of submitting when a row has no resolvable sensor type', async () => {
    const csv = 'sensorId,sensorTypeName,sensorMac\nsensor-1,Not A Real Type,AA:BB:CC:DD:EE:FF\n';
    component = new SensorsImportProgressIndicatorComponent(
      sensorsService,
      { fileSelectionEvent: fileSelectionEvent(csv), currentData: [], reloadCallback: () => {} },
      { close: jasmine.createSpy('close') } as unknown as MatDialogRef<SensorsImportProgressIndicatorComponent>,
      new Papa(),
      surveySettingsService
    );

    await component.submitToServer(OnRepetition.FORCE);

    expect(component.componentState).toEqual('VALIDATION_FAILED');
    expect(component.validationError).toEqual('sensorDevices.someOfTheRowsHasUnknownSensorType');
    expect(sensorsService.addSensors).not.toHaveBeenCalled();
  });
});
