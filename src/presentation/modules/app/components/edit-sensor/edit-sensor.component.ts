import { Component, Inject } from '@angular/core';
import { SensorDto } from '../../../../../domain/models/sensors-dtos';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';


export interface EditSensorComponentDialogParameter {
  sensor: SensorDto;
  allSensors: SensorDto[];
}

@Component({
  selector: 'app-edit-sensor',
  templateUrl: './edit-sensor.component.html',
  styleUrl: './edit-sensor.component.scss',
})
export class EditSensorComponent {
  readonly formGroup: FormGroup;
  private isBusy = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: EditSensorComponentDialogParameter,
    private readonly matDialogRef: MatDialogRef<EditSensorComponent>,
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {
    this.formGroup = new FormGroup({
      sensorId: new FormControl(this.data.sensor.sensorId),
      sensorMac: new FormControl(this.data.sensor.sensorMac, [
        Validators.required,
        Validators.pattern(
          /^[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}$/
        ),
        this.validateUniqueness.bind(this),
      ]),
    });
  }

  validateUniqueness(control: AbstractControl): ValidationErrors | null {
    if (this.data.allSensors.some((s) => s.sensorMac == control.value && s.sensorId != this.data.sensor.sensorId)) {
      return { macAlreadyExists: true };
    }
    return null;
  }

  getMacError(): string {
    if (this.formGroup.get('sensorMac')?.hasError('required')) {
      return 'sensorDevices.fieldIsRequired';
    }
    if (this.formGroup.get('sensorMac')?.hasError('pattern')) {
      return 'sensorDevices.notValidMacAddress';
    }
    if (this.formGroup.get('sensorMac')?.hasError('macAlreadyExists')) {
      return 'sensorDevices.macAlreadyExists';
    }
    return '';
  }

  close(): void {
    if (this.isBusy) {
      return;
    }
    this.matDialogRef.close();
  }

  save(): void {
    if (this.isBusy || this.formGroup.invalid) {
      return;
    }

    this.sensorsService
      .updateSensor(this.data.sensor.sensorId, {
        sensorMac: this.formGroup.get('sensorMac')?.value,
      })
      .subscribe({
        next: () => {
          this.data.sensor.sensorMac = this.formGroup.get('sensorMac')?.value;
          this.close();
        },
        error: (e) => {
          console.log(e);
          this.snackbar.open(
            this.translate.instant('sensorDevices.couldNotUpdate'),
            this.translate.instant('sensorDevices.ok')
          );
        },
      });
  }
}
