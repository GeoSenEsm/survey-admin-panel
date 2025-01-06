import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SensorDto } from '../../../../../domain/models/sensors-dtos';
import { MatTableDataSource } from '@angular/material/table';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SensorsImportProgressIndicatorComponent } from '../sensors-import-progress-indicator/sensors-import-progress-indicator.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EditSensorComponent } from '../edit-sensor/edit-sensor.component';
import { MatSort } from '@angular/material/sort';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { CreateSensorComponent } from '../create-sensor/create-sensor.component';

@Component({
  selector: 'app-devices',
  templateUrl: './sensor-devices.component.html',
  styleUrl: './sensor-devices.component.scss',
})
export class SensorDevicesComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatSort) sort?: MatSort;
  readonly dataSource = new MatTableDataSource<SensorDto>([]);
  readonly headers = ['sensorId', 'sensorMac'];
  isBusy = false;

  constructor(
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    private readonly matDialog: MatDialog,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly csvEportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort ?? null;
  }

  public loadData(): void {
    if (this.isBusy) {
      return;
    }

    this.dataSource.data = [];
    this.isBusy = true;
    this.sensorsService
      .getSensors()
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe((devices) => (this.dataSource.data = devices));
  }

  public import(): void {
    this.fileInput.nativeElement.click();
  }

  public onImport(event: Event) {
    this.matDialog.open(SensorsImportProgressIndicatorComponent, {
      data: {
        fileSelectionEvent: event,
        currentData: this.dataSource.data,
        reloadCallback: () => this.loadData(),
      },
    });
  }

  public edit(sensor: SensorDto): void {
    if (this.isBusy) {
      return;
    }

    this.matDialog.open(EditSensorComponent, {
      data: {
        sensor: sensor,
        allSensors: this.dataSource.data,
      },
    });
  }

  public delete(sensor: SensorDto): void {
    if (this.isBusy) {
      return;
    }

    this.isBusy = true;
    this.sensorsService
      .deleteSensor(sensor.sensorId)
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: () => {
          const idx = this.dataSource.data.findIndex(
            (item) => item.id === sensor.id
          );
          if (idx !== -1) {
            this.dataSource.data.splice(idx, 1);
            this.dataSource.data = [...this.dataSource.data];
          }
        },
        error: (e) => {
          console.log(e);
          this.snackbar.open(
            this.translate.instant('sensorDevices.couldNotDelete'),
            'OK'
          );
        },
      });
  }

  public export(): void {
    this.csvEportService.exportTableToCSV(
      this.dataSource.data,
      this.headers,
      this.translate.instant('sensorDevices.csvExportFilename')
    );
  }

  public createManually(): void {
    this.matDialog.open(CreateSensorComponent, {
      data: {
        allSensors: this.dataSource.data,
        refreshCallback: () => this.loadData()
      },
    });
  }
}
