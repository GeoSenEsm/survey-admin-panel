export interface SensorDto {
    id: string,
    sensorId: string,
    sensorMac: string,
    rowVersion: number
}

export interface UpdateSensorDto {
    sensorMac: string
}

export interface CreateSensorDto {
    sensorId: string
    sensorMac: string
}