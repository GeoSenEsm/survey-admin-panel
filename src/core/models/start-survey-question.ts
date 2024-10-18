export interface StartSurveyQuestion {
    id?: string;
    order: number;
    content: string;
    options: StartSurveyOption[];
}

export interface StartSurveyOption{
    id?: string;
    order: number;
    content: string;
}