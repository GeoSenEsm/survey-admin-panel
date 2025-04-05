export interface LocationData{
    respondentId: string,
    latitude: number,
    longitude: number
    dateTime: string,
    surveyId?: string,
    outsideResearchArea?: boolean,
    accuracyMeters?: number
}