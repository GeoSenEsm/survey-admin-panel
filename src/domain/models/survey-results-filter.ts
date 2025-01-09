export interface SurveyResultsFilter{
    surveyId: string,
    fromDate: Date,
    toDate: Date,
    respondentId?: string,
    outsideResearchArea?: boolean
}