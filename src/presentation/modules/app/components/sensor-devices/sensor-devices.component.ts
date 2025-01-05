import { Component, Inject, OnInit } from '@angular/core';
import { SensorDto } from '../../../../../domain/models/sensors-dtos';
import { MatTableDataSource } from '@angular/material/table';
import { SensorsService } from '../../../../../domain/external_services/sensors.service';
import { SENSORS_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-devices',
  templateUrl: './sensor-devices.component.html',
  styleUrl: './sensor-devices.component.scss',
})
export class SensorDevicesComponent implements OnInit {
  readonly dataSource = new MatTableDataSource<SensorDto>([]);
  readonly headers = ['sensorId', 'sensorMac'];
  isBusy = false;

  constructor(
    @Inject(SENSORS_SERVICE_TOKEN)
    private readonly sensorsService: SensorsService
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

  public import(): void {}

  public edit(sensor: SensorDto): void {}

  public delete(sensor: SensorDto): void {}
}
