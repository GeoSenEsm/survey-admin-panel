import { SurveyParticipationTimeSlotDto } from "./survey.participation.time.slot.dto";

export interface SurveySendingPolicyDto{
    id: string,
    surveyId: string,
    rowVersion: number,
    timeSlots: SurveyParticipationTimeSlotDto[]
}