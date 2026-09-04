import { Component, Inject, OnInit } from '@angular/core';
import {
  CreateSensorDto,
  SensorDto,
  SensorTypeDto,
} from '../../../../../domain/models/sensors-dtos';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, of, switchMap, throwError } from 'rxjs';
import { macPattern, normalizeMacInput, notIn } from '../../../../../core/utils/validators';
import { excludeNonSelectableSensorTypes } from '../../../../../core/utils/sensor-type-filters';
import { resolveRespondentId } from '../../../../../core/utils/respondent-resolver';
import { RespondentData } from '../../../../../domain/models/respondent-data';

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
  respondents: RespondentData[] = [];

  get respondentControl(): FormControl<RespondentData | string | null> {
    return this.formGroup.get('respondent') as FormControl<
      RespondentData | string | null
    >;
  }

  onRespondentsLoaded(respondents: RespondentData[]): void {
    this.respondents = respondents;
  }

  constructor(
    private readonly matDialogRef: MatDialogRef<CreateSensorComponent>,
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    private readonly translate: TranslateService,
    private readonly snackbar: MatSnackBar,
    private readonly router: Router,
    @Inject(MAT_DIALOG_DATA)
    private readonly data: CreateSensorComponentDialogParameter
  ) {
    this.formGroup = new FormGroup({
      sensorId: new FormControl('', [
        Validators.required,
        notIn(data.allSensors.map((s) => s.sensorId)),
      ]),
      sensorMac: new FormControl('', [
        notIn(data.allSensors.map((s) => s.sensorMac)),
        macPattern(),
      ]),
      sensorTypeId: new FormControl('', [Validators.required]),
      respondent: new FormControl<RespondentData | string | null>(null),
    });

    const sensorMac = this.formGroup.get('sensorMac');
    sensorMac?.valueChanges.subscribe((value: string) => {
      const normalized = normalizeMacInput(value);
      if (normalized !== value) {
        sensorMac.setValue(normalized, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.sensorsService
      .getSensorTypes()
      .pipe(catchError(() => of([] as SensorTypeDto[])))
      .subscribe((types) => {
        this.sensorTypes = excludeNonSelectableSensorTypes(types);
      });
  }

  public close(): void {
    this.matDialogRef.close();
  }

  public goToAddSensorType(): void {
    this.matDialogRef.close();
    this.router.navigateByUrl('/sensorProfiles');
  }

  public submit(): void {
    if (this.isBusy) {
      return;
    }
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const respondentId = resolveRespondentId(
      this.formGroup.get('respondent')?.value,
      this.respondents
    );
    if (respondentId === undefined) {
      this.snackbar.open(
        this.translate.instant('sensorDevices.respondentNotFound'),
        this.translate.instant('sensorDevices.ok')
      );
      return;
    }

    this.isBusy = true;
    const formValue = this.formGroup.value as CreateSensorDto;
    const model: CreateSensorDto = {
      sensorId: formValue.sensorId,
      sensorMac: formValue.sensorMac || null,
      sensorTypeId: formValue.sensorTypeId,
    };
    this.sensorsService
      .addSensors([model])
      .pipe(
        switchMap((createdSensors) => {
          const createdSensor = createdSensors[0];
          if (!createdSensor) {
            return throwError(
              () => new Error('Sensor creation did not return the created sensor')
            );
          }

          // Respondent assignment has no update API to undo individually, so a failure rolls
          // back by deleting the sensor just created (which also clears any respondent
          // assignment already written for it).
          const rollback = (error: unknown) =>
            this.sensorsService.deleteSensor(createdSensor.sensorId).pipe(
              catchError(() => of(undefined)),
              switchMap(() => throwError(() => error))
            );

          return respondentId
            ? this.sensorsService
                .assignRespondent(createdSensor.sensorId, { respondentId })
                .pipe(catchError(rollback))
            : of(createdSensor);
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
      return 'sensorDevices.notValidMacAddress';
    }

    return undefined;
  }
}
