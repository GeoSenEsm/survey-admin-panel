import { SensorIntegrationMode } from './sensor-profile';

export interface SensorDto {
    id: string,
    sensorId: string,
    sensorMac: string | null,
    respondentId?: string | null,
    respondentUsername?: string | null,
    sensorTypeId: string,
    sensorTypeCode?: string,
    sensorTypeName?: string,
    rowVersion: number
}

export interface SensorTypeDto {
    id: string,
    code: string,
    name: string
    integrationMode?: SensorIntegrationMode
    adapterKey?: string | null
}

export interface UpdateSensorDto {
    sensorMac: string | null
    sensorTypeId: string
}

export interface AssignSensorRespondentDto {
    respondentId: string | null
}

export interface CreateSensorDto {
    sensorId: string
    sensorMac: string | null
    sensorTypeId?: string
}
