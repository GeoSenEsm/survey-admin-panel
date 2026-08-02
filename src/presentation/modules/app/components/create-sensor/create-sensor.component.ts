import { Component, Inject, OnInit } from '@angular/core';
import {
  CreateSensorDto,
  SensorDto,
  SensorTypeDto,
} from '../../../../../domain/models/sensors-dtos';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, of, switchMap, throwError } from 'rxjs';
import { macPattern, notIn } from '../../../../../core/utils/validators';
import { SENSOR_PROFILE_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';

interface CreateSensorComponentDialogParameter {
  allSensors: SensorDto[];
  refreshCallback: () => void;
}

@Component({
  selector: 'app-create-sensor',
  templateUrl: './create-sensor.component.html',
  styleUrl: './create-sensor.component.scss',
})
export class CreateSensorComponent implements OnInit {
  isBusy = false;
  readonly formGroup: FormGroup;
  sensorTypes: SensorTypeDto[] = [];

  constructor(
    private readonly matDialogRef: MatDialogRef<CreateSensorComponent>,
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    @Inject(SENSOR_PROFILE_SERVICE_TOKEN)
    private readonly sensorProfileService: SensorProfileService,
    private readonly translate: TranslateService,
    private readonly snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    private readonly data: CreateSensorComponentDialogParameter
  ) {
    this.formGroup = new FormGroup({
      sensorId: new FormControl('', [
        Validators.required,
        notIn(data.allSensors.map((s) => s.sensorId)),
      ]),
      sensorMac: new FormControl('', [
        Validators.required,
        notIn(data.allSensors.map((s) => s.sensorMac)),
        macPattern(),
      ]),
      sensorTypeId: new FormControl('', [Validators.required]),
      bindKey: new FormControl('', [
        Validators.pattern(/^[0-9a-fA-F]{32}$/),
      ]),
    });

    this.formGroup
      .get('sensorTypeId')
      ?.valueChanges.subscribe(() => this.syncBindKeyAvailability());
  }

  ngOnInit(): void {
    this.sensorsService
      .getSensorTypes()
      .pipe(catchError(() => of([] as SensorTypeDto[])))
      .subscribe((types) => {
        this.sensorTypes = types;
        const xiaomi = types.find((t) => t.code === 'xiaomi');
        if (xiaomi && !this.formGroup.get('sensorTypeId')?.value) {
          this.formGroup.get('sensorTypeId')?.setValue(xiaomi.id);
        }
        this.syncBindKeyAvailability();
      });
  }

  get selectedSensorType(): SensorTypeDto | undefined {
    const sensorTypeId = this.formGroup.get('sensorTypeId')?.value;
    return this.sensorTypes.find((t) => t.id === sensorTypeId);
  }

  get bindKeyRequired(): boolean {
    return this.selectedSensorType?.requiredSecrets?.includes('bind_key') === true;
  }

  private syncBindKeyAvailability(): void {
    const bindKey = this.formGroup.get('bindKey');
    if (!bindKey) {
      return;
    }
    if (this.bindKeyRequired) {
      bindKey.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9a-fA-F]{32}$/),
      ]);
    } else {
      bindKey.setValue('');
      bindKey.setValidators([Validators.pattern(/^[0-9a-fA-F]{32}$/)]);
    }
    bindKey.updateValueAndValidity();
  }

  public close(): void {
    this.matDialogRef.close();
  }

  public submit(): void {
    if (this.isBusy || this.formGroup.invalid) {
      return;
    }

    this.isBusy = true;
    const formValue = this.formGroup.value as CreateSensorDto & {
      bindKey?: string;
    };
    const model: CreateSensorDto = {
      sensorId: formValue.sensorId,
      sensorMac: formValue.sensorMac,
      sensorTypeId: formValue.sensorTypeId,
    };
    this.sensorsService
      .addSensors([model])
      .pipe(
        switchMap((createdSensors) => {
          const createdSensor = createdSensors[0];
          return formValue.bindKey && createdSensor
            ? this.sensorProfileService
                .putDeviceSecret(createdSensor.id, 'bind_key', formValue.bindKey)
                .pipe(
                  catchError((error) =>
                    this.sensorsService.deleteSensor(createdSensor.sensorId).pipe(
                      catchError(() => of(undefined)),
                      switchMap(() => throwError(() => error))
                    )
                  )
                )
            : of(undefined);
        }),
        finalize(() => (this.isBusy = false))
      )
      .subscribe({
        next: () => {
          this.data.refreshCallback();
          this.close();
        },
        error: () => {
          this.snackbar.open(
            this.translate.instant('sensorDevices.couldNotCreate'),
            this.translate.instant('sensorDevices.ok')
          );
        },
      });
  }

  public getErrorMessage(controlName: string): string | undefined {
    const control = this.formGroup.controls[controlName];
    if (!control) {
      return undefined;
    }

    if (control.hasError('required')) {
      return 'sensorDevices.fieldIsRequired';
    }

    if (control.hasError('notIn')) {
      return 'sensorDevices.uniqueError';
    }

    if (control.hasError('pattern')) {
      if (controlName === 'bindKey') {
        return 'sensorDevices.bindKeyFormat';
      }
      return 'sensorDevices.notValidMacAddress';
    }

    return undefined;
  }
}
