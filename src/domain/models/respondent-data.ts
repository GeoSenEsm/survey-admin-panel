export type RespondentData = {
    id: string,
    username: string
} & any;

export interface RespondentFilters{
    filterOption?: RespondentFilterOption,
    amount: number
    from: Date,
    to: Date
}

export enum RespondentFilterOption{
    SKIPPED_SURVEYS = "skipped_surveys",
    LOCATION_NOT_SENT = "location_not_sent",
    SENSORS_DATA_NOT_SENT = "sensors_data_not_sent"
}