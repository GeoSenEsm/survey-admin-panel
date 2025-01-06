import { Component, Inject, OnInit } from '@angular/core';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import {
  CreateSensorDto,
  SensorDto,
} from '../../../../../domain/models/sensors-dtos';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Papa } from 'ngx-papaparse';

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
  readonly macRegex =
    /^[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}$/;

  constructor(
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    @Inject(MAT_DIALOG_DATA) private readonly data: SensorsImportDialogArgs,
    private readonly matDialogRef: MatDialogRef<SensorsImportProgressIndicatorComponent>,
    private readonly papa: Papa<CreateSensorDto>
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
        error: (e) => {
          console.log(e);
          this.componentState = 'ERROR';
        },
      });
    } catch (e: any) {
      console.log(e);
      this.componentState = 'ERROR';
    }
  }

  readDataToSubmit(fileSelectionEvent: Event): Promise<CreateSensorDto[]> {
    const input = fileSelectionEvent.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      return new Promise((resolve, reject) => {
        this.papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            resolve(result.data as CreateSensorDto[]);
          },
          error: (error) => {
            reject(error);
          },
        });
      });
    }

    return Promise.resolve([]);
  }

  private validate(
    onRepetition: OnRepetition,
    newEntries: CreateSensorDto[]
  ): boolean {
    //todo: validate mac uniqueness

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
