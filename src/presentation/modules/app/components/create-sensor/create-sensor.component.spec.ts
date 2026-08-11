import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { CreateSensorComponent } from './create-sensor.component';

describe('CreateSensorComponent', () => {
  let sensorsService: jasmine.SpyObj<SensorsService>;
  let profileService: jasmine.SpyObj<SensorProfileService>;
  let snackbar: jasmine.SpyObj<MatSnackBar>;
  let component: CreateSensorComponent;

  beforeEach(() => {
    sensorsService = jasmine.createSpyObj<SensorsService>('SensorsService', [
      'getSensors',
      'getSensorTypes',
      'addSensors',
      'updateSensor',
      'assignRespondent',
      'deleteSensor',
    ]);
    profileService = jasmine.createSpyObj<SensorProfileService>('SensorProfileService', [
      'getCapabilities',
      'listSensorTypes',
      'createSensorType',
      'listRevisions',
      'getRevision',
      'createDraft',
      'updateDraft',
      'validateDraft',
      'publish',
      'rollback',
      'putDeviceSecret',
    ]);
    sensorsService.getSensorTypes.and.returnValue(of([]));
    snackbar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    component = new CreateSensorComponent(
      { close: jasmine.createSpy('close') } as unknown as MatDialogRef<CreateSensorComponent>,
      sensorsService,
      profileService,
      { instant: (key: string) => key } as unknown as TranslateService,
      snackbar,
      {} as unknown as Router,
      { allSensors: [], refreshCallback: jasmine.createSpy('refreshCallback') }
    );
    component.formGroup.setValue({
      sensorId: 'sensor-1',
      sensorMac: 'AA:BB:CC:DD:EE:FF',
      sensorTypeId: 'type-1',
      bindKey: '',
      respondent: null,
    });
  });

  it('reports an error instead of closing when bulk-create returns no sensor', () => {
    sensorsService.addSensors.and.returnValue(of([]));

    component.submit();

    expect(snackbar.open).toHaveBeenCalledWith(
      'sensorDevices.couldNotCreate',
      'sensorDevices.ok'
    );
    expect(profileService.putDeviceSecret).not.toHaveBeenCalled();
  });

  it('closes normally when the sensor is created without a bind key', () => {
    sensorsService.addSensors.and.returnValue(
      of([{ id: 'row-1', sensorId: 'sensor-1', sensorMac: 'AA:BB:CC:DD:EE:FF', sensorTypeId: 'type-1', rowVersion: 1 }])
    );

    component.submit();

    expect(snackbar.open).not.toHaveBeenCalled();
    expect(profileService.putDeviceSecret).not.toHaveBeenCalled();
  });
});
