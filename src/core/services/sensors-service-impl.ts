import { Injectable } from '@angular/core';
import { SensorsService } from '../../domain/external_services/sensors.service';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
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
