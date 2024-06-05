import { CreateSurveyParticipationTimeSlotDto } from "./create.survey.participation.time.slot.dto";

export interface CreateSurveySendingPolicyDto{
    surveyId: string;
    surveyParticipationTimeSlots: CreateSurveyParticipationTimeSlotDto[];
}