import { Component, Inject, OnInit } from '@angular/core';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import {
  SENSORS_SERVICE_TOKEN,
  SURVEY_SETTINGS_SERVICE_TOKEN,
} from '../../../../../core/services/injection-tokens';
import {
  CreateSensorDto,
  SensorDto,
} from '../../../../../domain/models/sensors-dtos';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Papa } from 'ngx-papaparse';
import { firstValueFrom } from 'rxjs';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';
import { DEFAULT_SURVEY_SETTINGS } from '../../../../../domain/models/survey-settings';
import { MAC_REGEX, normalizeMacInput } from '../../../../../core/utils/validators';

/** Shape of one parsed CSV row before sensorTypeName is resolved into a sensorTypeId. */
interface RawSensorImportRow {
  sensorId?: string;
  sensorTypeName?: string;
  sensorMac?: string;
  respondentUsername?: string;
}

type SensorsImportState =
  | 'UNKNOWN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ERROR'
  | 'REPETITIONS_DECISION_REQUIRED'
  | 'VALIDATION_FAILED';
export enum OnRepetition {
  FORCE,
  SKIP,
  ALLOW_TO_DECIDE,
}

export interface SensorsImportDialogArgs {
  fileSelectionEvent: Event;
  currentData: SensorDto[];
  reloadCallback: () => void;
}

@Component({
  selector: 'app-sensors-import-progress-indicator',
  templateUrl: './sensors-import-progress-indicator.component.html',
  styleUrl: './sensors-import-progress-indicator.component.scss',
})
export class SensorsImportProgressIndicatorComponent implements OnInit {
  OnRepetition = OnRepetition;
  componentState: SensorsImportState = 'UNKNOWN';
  validationError?: string;

  constructor(
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    @Inject(MAT_DIALOG_DATA) private readonly data: SensorsImportDialogArgs,
    private readonly matDialogRef: MatDialogRef<SensorsImportProgressIndicatorComponent>,
    private readonly papa: Papa<CreateSensorDto>,
    @Inject(SURVEY_SETTINGS_SERVICE_TOKEN)
    private readonly surveySettingsService: SurveySettingsService
  ) {}

  ngOnInit(): void {
    this.submitToServer(OnRepetition.ALLOW_TO_DECIDE);
  }

  public async submitToServer(onRepetition: OnRepetition): Promise<void> {
    if (this.componentState === 'IN_PROGRESS') {
      return;
    }

    try {
      this.componentState = 'IN_PROGRESS';
      const dataToSubmit = await this.readDataToSubmit(
        this.data.fileSelectionEvent
      );
      if (!this.validate(onRepetition, dataToSubmit)) {
        return;
      }

      this.sensorsService.addSensors(dataToSubmit).subscribe({
        next: () => {
          this.componentState = 'COMPLETED';
          this.data.reloadCallback();
        },
        error: () => {
          this.componentState = 'ERROR';
        },
      });
    } catch {
      this.componentState = 'ERROR';
    }
  }

  async readDataToSubmit(fileSelectionEvent: Event): Promise<CreateSensorDto[]> {
    const input = fileSelectionEvent.target as HTMLInputElement;
    if (!input.files || !input.files[0]) {
      return [];
    }
    const file = input.files[0];

    const settings = await firstValueFrom(this.surveySettingsService.getSettings()).catch(
      () => DEFAULT_SURVEY_SETTINGS
    );
    const rows = await new Promise<RawSensorImportRow[]>((resolve, reject) => {
      this.papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: settings.csvColumnSeparator,
        complete: (result) => resolve(result.data as RawSensorImportRow[]),
        error: (error) => reject(error),
      });
    });

    const sensorTypes = await firstValueFrom(this.sensorsService.getSensorTypes()).catch(() => []);
    const sensorTypeIdByName = new Map(
      sensorTypes.map((type) => [type.name.trim().toLowerCase(), type.id])
    );

    // sensorTypeId is left undefined (rather than dropping the row) when the name in the CSV
    // doesn't match any known sensor type, so validate() can surface it as a clear error instead
    // of the backend's generic 400 for a missing required field.
    return rows.map((row) => ({
      sensorId: row.sensorId ?? '',
      sensorMac: row.sensorMac ? normalizeMacInput(row.sensorMac) : null,
      sensorTypeId: row.sensorTypeName
        ? sensorTypeIdByName.get(row.sensorTypeName.trim().toLowerCase())
        : undefined,
    }));
  }

  private validate(
    onRepetition: OnRepetition,
    newEntries: CreateSensorDto[]
  ): boolean {
    if (newEntries.some((e) => !e.sensorTypeId)) {
      this.componentState = 'VALIDATION_FAILED';
      this.validationError = 'sensorDevices.someOfTheRowsHasUnknownSensorType';
      return false;
    }

    if (newEntries.some((e) => !e.sensorMac || !MAC_REGEX.test(e.sensorMac))) {
      this.componentState = 'VALIDATION_FAILED';
      this.validationError = 'sensorDevices.someOfTheRowsHasInvalidMacFormat';
      return false;
    }

    if (
      newEntries.some((newEntry) =>
        this.data.currentData.some(
          (e) =>
            e.sensorMac === newEntry.sensorMac &&
            e.sensorId !== newEntry.sensorId
        )
      )
    ) {
      this.componentState = 'VALIDATION_FAILED';
      this.validationError = 'sensorDevices.macsNotUnique';
      return false;
    }

    if (onRepetition === OnRepetition.FORCE) {
      return true;
    }

    const newSensorIds = newEntries.map((e) => e.sensorId);
    const oldSensorIds = this.data.currentData.map((e) => e.sensorId);
    if (!this.data.currentData.some((e) => newSensorIds.includes(e.sensorId))) {
      return true;
    }

    if (onRepetition == OnRepetition.ALLOW_TO_DECIDE) {
      this.componentState = 'REPETITIONS_DECISION_REQUIRED';
      return false;
    }

    if (onRepetition == OnRepetition.SKIP) {
      for (let i = newEntries.length - 1; i >= 0; i--) {
        if (oldSensorIds.includes(newEntries[i].sensorId)) {
          newEntries.splice(i, 1);
        }
      }
      return true;
    }

    return false;
  }

  close(): void {
    this.matDialogRef.close();
  }
}
