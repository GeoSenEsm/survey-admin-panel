import { TimeRange } from "../../core/models/time-range";
import { CreateSurveyParticipationTimeSlotDto } from "./create-survey-participation-time-slot-dto";

export interface CreateSurveySendingPolicyDto{
    surveyId: string;
    surveyParticipationTimeSlots: CreateSurveyParticipationTimeSlotDto[];
}

export const crossDatesAndTimes = (surveyId: string, dates: Date[], timeRanges: TimeRange[]) => 
    {
        const model: CreateSurveySendingPolicyDto = {
            surveyId: surveyId,
            surveyParticipationTimeSlots: []
        }
    
        dates.forEach(date => {
            timeRanges.forEach(range => {
                const utcDateFrom = Date.UTC(date.getFullYear(), 
                date.getMonth(), 
                date.getDate(),
                range.from.hours,
                range.from.minutes);
    
                const utcDateTo = Date.UTC(date.getFullYear(), 
                date.getMonth(), 
                date.getDate(),
                range.to.hours,
                range.to.minutes);
    
                model.surveyParticipationTimeSlots.push({
                    start: new Date(utcDateFrom),
                    finish: new Date(utcDateTo)
                })
            })
        })
    
        return model;
    };