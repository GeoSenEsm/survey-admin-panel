import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { SensorDto } from '../../../../../domain/models/sensors-dtos';
import { MatTableDataSource } from '@angular/material/table';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SensorsImportProgressIndicatorComponent } from '../sensors-import-progress-indicator/sensors-import-progress-indicator.component';

@Component({
  selector: 'app-devices',
  templateUrl: './sensor-devices.component.html',
  styleUrl: './sensor-devices.component.scss',
})
export class SensorDevicesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  readonly dataSource = new MatTableDataSource<SensorDto>([]);
  readonly headers = ['sensorId', 'sensorMac'];
  isBusy = false;

  constructor(
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService,
    private readonly matDialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadData();
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

  public onImport(event: Event){
    this.matDialog.open(SensorsImportProgressIndicatorComponent, {
      data: {
        fileSelectionEvent: event,
        currentData: this.dataSource.data,
        reloadCallback: () => this.loadData(),
      }
    });
  }

  public edit(sensor: SensorDto): void {}

  public delete(sensor: SensorDto): void {}
}
