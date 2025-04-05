export interface SurveyResultEntry {
    surveyName: string;
    question: string;
    responseDate: string;
    answers: any[];
    respondentId: string;
    longitude?: number;
    latitude?: number;
    outsideResearchArea?: boolean;
    temperature?: number;
    humidity?: number;
    accuracyMeters?: number;
}