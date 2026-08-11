import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SensorDto } from '../../../../../domain/models/sensors-dtos';
import { EditSensorComponent } from './edit-sensor.component';

describe('EditSensorComponent device secrets', () => {
  const sensor: SensorDto = {
    id: 'sensor-row-id',
    sensorId: 'door-1',
    sensorMac: 'AA:BB:CC:DD:EE:FF',
    sensorTypeId: 'door-type',
    configuredSecrets: ['bind_key'],
    rowVersion: 1,
  };
  let sensorsService: jasmine.SpyObj<SensorsService>;
  let profileService: jasmine.SpyObj<SensorProfileService>;
  let component: EditSensorComponent;

  beforeEach(() => {
    sensorsService = jasmine.createSpyObj<SensorsService>('SensorsService', [
      'getSensors',
      'getSensorTypes',
      'addSensors',
      'updateSensor',
      'assignRespondent',
      'deleteSensor',
    ]);
    profileService = jasmine.createSpyObj<SensorProfileService>(
      'SensorProfileService',
      [
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
      ]
    );
    sensorsService.updateSensor.and.returnValue(of(undefined));
    sensorsService.assignRespondent.and.returnValue(of(sensor));
    profileService.putDeviceSecret.and.returnValue(of(undefined));
    component = new EditSensorComponent(
      { sensor: { ...sensor }, allSensors: [sensor] },
      { close: jasmine.createSpy('close') } as unknown as MatDialogRef<EditSensorComponent>,
      sensorsService,
      profileService,
      { open: jasmine.createSpy('open') } as unknown as MatSnackBar,
      { instant: (key: string) => key } as unknown as TranslateService
    );
  });

  it('shows configured state without rehydrating the existing bind key', () => {
    expect(component.bindKeyConfigured).toBeTrue();
    expect(component.formGroup.get('bindKey')?.value).toBe('');
  });

  it('does not send a secret request when the write-only field stays blank', () => {
    component.save();

    expect(profileService.putDeviceSecret).not.toHaveBeenCalled();
  });

  it('sends a newly entered key only to the device secret endpoint', () => {
    const bindKey = '00112233445566778899aabbccddeeff';
    component.formGroup.get('bindKey')?.setValue(bindKey);

    component.save();

    expect(profileService.putDeviceSecret).toHaveBeenCalledWith(
      'sensor-row-id',
      'bind_key',
      bindKey
    );
    expect(sensorsService.updateSensor).toHaveBeenCalledWith('door-1', {
      sensorMac: 'AA:BB:CC:DD:EE:FF',
      sensorTypeId: 'door-type',
    });
  });

  describe('rollback failure reporting', () => {
    it('shows the generic failure message when a failed rollback still succeeds', () => {
      const snackbar = { open: jasmine.createSpy('open') } as unknown as MatSnackBar;
      sensorsService.assignRespondent.and.returnValue(
        throwError(() => new Error('assign failed'))
      );
      sensorsService.updateSensor.and.returnValue(of(undefined));
      component = new EditSensorComponent(
        { sensor: { ...sensor }, allSensors: [sensor] },
        { close: jasmine.createSpy('close') } as unknown as MatDialogRef<EditSensorComponent>,
        sensorsService,
        profileService,
        snackbar,
        { instant: (key: string) => key } as unknown as TranslateService
      );

      component.save();

      expect(snackbar.open).toHaveBeenCalledWith(
        'sensorDevices.couldNotUpdate',
        'sensorDevices.ok'
      );
    });

    it('shows an inconsistent-state warning when the compensating rollback itself fails', () => {
      const snackbar = { open: jasmine.createSpy('open') } as unknown as MatSnackBar;
      sensorsService.assignRespondent.and.returnValue(
        throwError(() => new Error('assign failed'))
      );
      sensorsService.updateSensor.and.returnValues(
        of(undefined),
        throwError(() => new Error('rollback failed'))
      );
      component = new EditSensorComponent(
        { sensor: { ...sensor }, allSensors: [sensor] },
        { close: jasmine.createSpy('close') } as unknown as MatDialogRef<EditSensorComponent>,
        sensorsService,
        profileService,
        snackbar,
        { instant: (key: string) => key } as unknown as TranslateService
      );

      component.save();

      expect(snackbar.open).toHaveBeenCalledWith(
        'sensorDevices.inconsistentStateAfterFailedSave',
        'sensorDevices.ok'
      );
    });
  });
});
