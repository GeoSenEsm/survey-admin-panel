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
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { macPattern } from '../../../../../core/utils/validators';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { catchError, finalize, of, switchMap } from 'rxjs';

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

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: EditSensorComponentDialogParameter,
    private readonly matDialogRef: MatDialogRef<EditSensorComponent>,
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
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
      respondent: new FormControl<RespondentData | string | null>(
        initialRespondent
      ),
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
      .subscribe((types) => (this.sensorTypes = types));
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
    if (this.isBusy || this.formGroup.invalid) {
      return;
    }

    const respondentValue = this.formGroup.get('respondent')?.value;
    let respondentId: string | null = null;
    if (respondentValue && typeof respondentValue === 'object' && respondentValue.id) {
      respondentId = respondentValue.id;
    } else if (typeof respondentValue === 'string' && respondentValue.trim()) {
      const match = this.respondents.find(
        (r) => r.username === respondentValue.trim()
      );
      if (!match) {
        this.snackbar.open(
          this.translate.instant('sensorDevices.respondentNotFound'),
          this.translate.instant('sensorDevices.ok')
        );
        return;
      }
      respondentId = match.id;
    }

    this.isBusy = true;
    const sensorMac = this.formGroup.get('sensorMac')?.value as string;
    const sensorTypeId = this.formGroup.get('sensorTypeId')?.value as string;
    this.sensorsService
      .updateSensor(this.data.sensor.sensorId, { sensorMac, sensorTypeId })
      .pipe(
        switchMap(() =>
          this.sensorsService.assignRespondent(this.data.sensor.sensorId, {
            respondentId,
          })
        ),
        finalize(() => (this.isBusy = false))
      )
      .subscribe({
        next: (assignment) => {
          this.data.sensor.sensorMac = sensorMac;
          this.data.sensor.sensorTypeId = assignment.sensorTypeId;
          this.data.sensor.sensorTypeCode = assignment.sensorTypeCode;
          this.data.sensor.sensorTypeName = assignment.sensorTypeName;
          this.data.sensor.respondentId = assignment.respondentId ?? null;
          this.data.sensor.respondentUsername =
            assignment.respondentUsername ?? null;
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
}
