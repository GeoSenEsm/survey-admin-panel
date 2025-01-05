import { Observable } from "rxjs";
import { CreateSensorDto, SensorDto, UpdateSensorDto } from "../models/sensors-dtos";

export interface SensorsService {
    getSensors(): Observable<SensorDto[]>;
    addSensors(sensors: CreateSensorDto[]): Observable<any>;
    updateSensor(id: string, sensor: UpdateSensorDto): Observable<any>;
    deleteSensor(id: string): Observable<any>;
}