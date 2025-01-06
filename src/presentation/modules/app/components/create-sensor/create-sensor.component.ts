import { Component, Inject } from '@angular/core';
import {
  CreateSensorDto,
  SensorDto,
} from '../../../../../domain/models/sensors-dtos';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { macPattern, notIn } from '../../../../../core/utils/validators';

interface CreateSensorComponentDialogParameter {
  allSensors: SensorDto[];
  refreshCallback: () => void;
}

@Component({
  selector: 'app-create-sensor',
  templateUrl: './create-sensor.component.html',
  styleUrl: './create-sensor.component.scss',
})
export class CreateSensorComponent {
  isBusy = false;
  readonly formGroup: FormGroup;

  constructor(
    private readonly matDialogRef: MatDialogRef<CreateSensorComponent>,
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
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
    });
  }

  public close(): void {
    this.matDialogRef.close();
  }

  public submit(): void {
    if (this.isBusy || this.formGroup.invalid) {
      return;
    }

    this.isBusy = true;
    const model = this.formGroup.value as CreateSensorDto;
    this.sensorsService
      .addSensors([model])
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (response) => {
          this.data.refreshCallback();
          this.close();
        },
        error: (error) => {
          console.log(error);
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
      return 'sensorDevices.notValidMacAddress';
    }

    return undefined;
  }
}
