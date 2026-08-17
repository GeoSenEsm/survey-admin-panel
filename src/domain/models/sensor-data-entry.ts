export interface SensorDataValue {
    parameterCode: string;
    value: string;
}

export interface SensorDataEntry {
    respondentId: string;
    dateTime: string;
    source: string;
    values: SensorDataValue[];
    surveyId: string | null;
}