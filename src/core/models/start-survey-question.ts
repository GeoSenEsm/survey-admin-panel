export interface StartSurveyQuestion {
    order: number;
    content: string;
    options: StartSurveyOption[];
}

export interface StartSurveyOption{
    order: number;
    content: string;
}