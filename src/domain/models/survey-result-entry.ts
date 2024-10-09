export interface SurveyResultEntry {
    surveyName: string;
    question: string;
    responseDate: Date;
    answers: any[];
    respondentId: string;
}