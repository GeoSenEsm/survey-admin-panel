export interface SensorReadingValue {
    parameterCode: string;
    value: string;
}

export interface SurveyResultEntry {
    surveyName: string;
    question: string;
    responseDate: string;
    answers: any[];
    respondentId: string;
    longitude?: number;
    latitude?: number;
    outsideResearchArea?: boolean;
    sensorSource?: string;
    sensorValues?: SensorReadingValue[];
    accuracyMeters?: number;
}