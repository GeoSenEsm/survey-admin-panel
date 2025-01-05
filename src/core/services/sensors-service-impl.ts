import { Injectable } from '@angular/core';
import { SensorsService } from '../../domain/external_services/sensors.service';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import {
  SensorDto,
  CreateSensorDto,
  UpdateSensorDto,
} from '../../domain/models/sensors-dtos';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class SensorsServiceImpl extends ApiService implements SensorsService {
  constructor(httpClient: HttpClient, configService: ConfigService) {
    super(httpClient, configService);
  }

  getSensors(): Observable<SensorDto[]> {
    const sensors: SensorDto[] = Array.from({ length: 100 }, (_, i) => ({
        id: (i + 1).toString(),
        sensorId: `SENSOR-${i + 1}`,
        sensorMac: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
        rowVersion: Math.floor(Math.random() * 100),
      }));
      return of(sensors);
    return this.get('/api/sensormac/all');
  }
  addSensors(sensors: CreateSensorDto[]): Observable<any> {
    return this.post('/api/sensormac', sensors);
  }
  updateSensor(id: string, sensor: UpdateSensorDto): Observable<any> {
    return this.put(`/api/sensormac/${id}`, sensor);
  }

  deleteSensor(id: string): Observable<any> {
    return this.delete(`/api/sensormac/${id}`);
  }
}
