export interface SensorDataValue {
    parameterCode: string;
    value: string;
}

export interface TemperatureDataEntry {
    respondentId: string;
    dateTime: string;
    source: string;
    values: SensorDataValue[];
}