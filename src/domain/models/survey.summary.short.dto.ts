import { SurveyDto } from "./survey.dto";
import { SurveyParticipationTimeSlotDto } from "./survey.participation.time.slot.dto";

export interface SurveySummaryShortDto extends SurveyDto{
    dates: SurveyParticipationTimeSlotDto[]
}