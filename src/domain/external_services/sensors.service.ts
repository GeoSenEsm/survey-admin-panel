import { Observable } from "rxjs";
import { AssignSensorRespondentDto, CreateSensorDto, SensorDto, SensorTypeDto, UpdateSensorDto } from "../models/sensors-dtos";

export interface SensorsService {
    getSensors(): Observable<SensorDto[]>;
    getSensorTypes(): Observable<SensorTypeDto[]>;
    addSensors(sensors: CreateSensorDto[]): Observable<SensorDto[]>;
    updateSensor(id: string, sensor: UpdateSensorDto): Observable<any>;
    assignRespondent(sensorId: string, body: AssignSensorRespondentDto): Observable<SensorDto>;
    deleteSensor(id: string): Observable<any>;
}
