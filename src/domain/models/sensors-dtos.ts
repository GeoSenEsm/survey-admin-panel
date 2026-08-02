export interface SensorDto {
    id: string,
    sensorId: string,
    sensorMac: string,
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
}

export interface UpdateSensorDto {
    sensorMac: string
    sensorTypeId: string
}

export interface AssignSensorRespondentDto {
    respondentId: string | null
}

export interface CreateSensorDto {
    sensorId: string
    sensorMac: string
    sensorTypeId?: string
}
