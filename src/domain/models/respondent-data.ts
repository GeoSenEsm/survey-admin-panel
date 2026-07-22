export type RespondentData = {
    id: string,
    username: string,
    surveyStartDate?: string | null,
    surveyEndDate?: string | null,
} & any;

export interface RespondentFilters{
    filterOption?: RespondentFilterOption,
    amount: number
    from: Date,
    to: Date
    /** Client-side: require assigned window / unset / any */
    surveyWindowFilter?: SurveyWindowPresenceFilter
    surveyStartFrom?: Date | null
    surveyStartTo?: Date | null
    surveyEndFrom?: Date | null
    surveyEndTo?: Date | null
}

export enum SurveyWindowPresenceFilter {
    ANY = 'any',
    SET = 'set',
    UNSET = 'unset',
}

export enum RespondentFilterOption{
    SKIPPED_SURVEYS = "skipped_surveys",
    LOCATION_NOT_SENT = "location_not_sent",
    SENSORS_DATA_NOT_SENT = "sensors_data_not_sent"
}