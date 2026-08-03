import { Component, Inject, OnInit } from '@angular/core';
import { SensorDto, SensorTypeDto } from '../../../../../domain/models/sensors-dtos';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import {
  SENSOR_PROFILE_SERVICE_TOKEN,
  SENSORS_SERVICE_TOKEN,
} from '../../../../../core/services/injection-tokens';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { macPattern, normalizeMacInput } from '../../../../../core/utils/validators';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { catchError, finalize, of, switchMap, throwError } from 'rxjs';
import { SensorProfileService } from '../../../../../domain/external_services/sensor-profile.service';
import { excludeNonSelectableSensorTypes } from '../../../../../core/utils/sensor-type-filters';

export interface EditSensorComponentDialogParameter {
  sensor: SensorDto;
  allSensors: SensorDto[];
}

@Component({
  selector: 'app-edit-sensor',
  templateUrl: './edit-sensor.component.html',
  styleUrl: './edit-sensor.component.scss',
})
export class EditSensorComponent implements OnInit {
  readonly formGroup: FormGroup;
  respondents: RespondentData[] = [];
  filteredRespondents: RespondentData[] = [];
  sensorTypes: SensorTypeDto[] = [];
  isBusy = false;
  loadingRespondents = false;

  get bindKeyConfigured(): boolean {
    return this.data.sensor.configuredSecrets?.includes('bind_key') === true;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: EditSensorComponentDialogParameter,
    private readonly matDialogRef: MatDialogRef<EditSensorComponent>,
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    @Inject(SENSOR_PROFILE_SERVICE_TOKEN)
    private readonly sensorProfileService: SensorProfileService,
    @Inject('respondentDataService')
    private readonly respondentDataService: RespondentDataService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {
    const initialRespondent =
      this.data.sensor.respondentId && this.data.sensor.respondentUsername
        ? ({
            id: this.data.sensor.respondentId,
            username: this.data.sensor.respondentUsername,
          } as RespondentData)
        : null;

    this.formGroup = new FormGroup({
      sensorId: new FormControl(this.data.sensor.sensorId),
      sensorMac: new FormControl(this.data.sensor.sensorMac, [
        Validators.required,
        macPattern(),
        this.validateUniqueness.bind(this),
      ]),
      sensorTypeId: new FormControl(this.data.sensor.sensorTypeId, [
        Validators.required,
      ]),
      bindKey: new FormControl('', [
        Validators.pattern(/^[0-9a-fA-F]{32}$/),
      ]),
      respondent: new FormControl<RespondentData | string | null>(
        initialRespondent
      ),
    });

    this.formGroup
      .get('sensorTypeId')
      ?.valueChanges.subscribe(() => this.syncBindKeyAvailability());

    const sensorMac = this.formGroup.get('sensorMac');
    sensorMac?.valueChanges.subscribe((value: string) => {
      const normalized = normalizeMacInput(value);
      if (normalized !== value) {
        sensorMac.setValue(normalized, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.loadingRespondents = true;
    this.respondentDataService
      .getRespondents(undefined)
      .pipe(
        catchError(() => of([] as RespondentData[])),
        finalize(() => (this.loadingRespondents = false))
      )
      .subscribe((respondents) => {
        this.respondents = respondents;
        this.filteredRespondents = respondents;
      });

    this.sensorsService
      .getSensorTypes()
      .pipe(catchError(() => of([] as SensorTypeDto[])))
      .subscribe((types) => {
        this.sensorTypes = excludeNonSelectableSensorTypes(types);
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
    // A device that already has a bind key configured may leave the field blank to keep
    // it (see bindKeyEditHint); only force entry when the type requires one and none is
    // configured yet.
    if (this.bindKeyRequired && !this.bindKeyConfigured) {
      bindKey.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9a-fA-F]{32}$/),
      ]);
    } else {
      if (!this.bindKeyRequired) {
        bindKey.setValue('');
      }
      bindKey.setValidators([Validators.pattern(/^[0-9a-fA-F]{32}$/)]);
    }
    bindKey.updateValueAndValidity();
  }

  validateUniqueness(control: AbstractControl): ValidationErrors | null {
    if (
      this.data.allSensors.some(
        (s) =>
          s.sensorMac == control.value &&
          s.sensorId != this.data.sensor.sensorId
      )
    ) {
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

  getBindKeyError(): string {
    if (this.formGroup.get('bindKey')?.hasError('required')) {
      return 'sensorDevices.fieldIsRequired';
    }
    return this.formGroup.get('bindKey')?.hasError('pattern')
      ? 'sensorDevices.bindKeyFormat'
      : '';
  }

  displayRespondent = (value: RespondentData | string | null): string => {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    return value.username ?? '';
  };

  filterRespondents(value: string): void {
    const needle = (value ?? '').toLowerCase().trim();
    this.filteredRespondents = needle
      ? this.respondents.filter((r) =>
          String(r.username).toLowerCase().includes(needle)
        )
      : this.respondents.slice();
  }

  onRespondentInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterRespondents(value);
  }

  clearRespondent(): void {
    this.formGroup.get('respondent')?.setValue(null);
    this.filteredRespondents = this.respondents.slice();
  }

  close(): void {
    if (this.isBusy) {
      return;
    }
    this.matDialogRef.close();
  }

  save(): void {
    if (this.isBusy) {
      return;
    }
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const respondentId = this.resolveRespondentId();
    if (respondentId === undefined) {
      return;
    }

    this.isBusy = true;
    const sensorMac = this.formGroup.get('sensorMac')?.value as string;
    const sensorTypeId = this.formGroup.get('sensorTypeId')?.value as string;
    const bindKey = this.formGroup.get('bindKey')?.value as string;
    const originalSensorMac = this.data.sensor.sensorMac;
    const originalSensorTypeId = this.data.sensor.sensorTypeId;
    const originalRespondentId = this.data.sensor.respondentId ?? null;

    const revertSensorFields = () =>
      this.sensorsService
        .updateSensor(this.data.sensor.sensorId, {
          sensorMac: originalSensorMac,
          sensorTypeId: originalSensorTypeId,
        })
        .pipe(catchError(() => of(undefined)));

    const revertRespondent = () =>
      this.sensorsService
        .assignRespondent(this.data.sensor.sensorId, {
          respondentId: originalRespondentId,
        })
        .pipe(catchError(() => of(undefined)));

    // Order steps so the hardest step to undo (the bind key, which has no delete API) runs
    // last: if it fails, the two earlier, freely revertible mutations are rolled back first.
    this.sensorsService
      .updateSensor(this.data.sensor.sensorId, {
        sensorMac,
        sensorTypeId,
      })
      .pipe(
        switchMap(() =>
          this.sensorsService
            .assignRespondent(this.data.sensor.sensorId, { respondentId })
            .pipe(
              catchError((error) =>
                revertSensorFields().pipe(
                  switchMap(() => throwError(() => error))
                )
              )
            )
        ),
        switchMap((assignment) =>
          bindKey
            ? this.sensorProfileService
                .putDeviceSecret(this.data.sensor.id, 'bind_key', bindKey)
                .pipe(
                  switchMap(() => of(assignment)),
                  catchError((error) =>
                    revertRespondent().pipe(
                      switchMap(() => revertSensorFields()),
                      switchMap(() => throwError(() => error))
                    )
                  )
                )
            : of(assignment)
        ),
        finalize(() => (this.isBusy = false))
      )
      .subscribe({
        next: (assignment) => {
          Object.assign(this.data.sensor, {
            sensorMac,
            sensorTypeId: assignment.sensorTypeId,
            sensorTypeCode: assignment.sensorTypeCode,
            sensorTypeName: assignment.sensorTypeName,
            respondentId: assignment.respondentId ?? null,
            respondentUsername: assignment.respondentUsername ?? null,
            configuredSecrets:
              assignment.configuredSecrets ??
              this.data.sensor.configuredSecrets ??
              (bindKey ? ['bind_key'] : []),
          });
          this.close();
        },
        error: () => {
          this.snackbar.open(
            this.translate.instant('sensorDevices.couldNotUpdate'),
            this.translate.instant('sensorDevices.ok')
          );
        },
      });
  }

  /** `undefined` means the typed username did not match any respondent. */
  private resolveRespondentId(): string | null | undefined {
    const respondentValue = this.formGroup.get('respondent')?.value;
    if (respondentValue && typeof respondentValue === 'object' && respondentValue.id) {
      return respondentValue.id;
    }
    if (typeof respondentValue === 'string' && respondentValue.trim()) {
      const match = this.respondents.find(
        (r) => r.username === respondentValue.trim()
      );
      if (!match) {
        this.snackbar.open(
          this.translate.instant('sensorDevices.respondentNotFound'),
          this.translate.instant('sensorDevices.ok')
        );
        return undefined;
      }
      return match.id;
    }
    return null;
  }
}
