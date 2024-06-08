import { SurveyDto } from "./survey.dto";

export interface SurveySummaryShortDto extends SurveyDto{
    dates: Date[]
}