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
                const dateFrom = new Date(date.getFullYear(), 
                date.getMonth(), 
                date.getDate(),
                range.from.hours,
                range.from.minutes);
    
                const dateTo = new Date(date.getFullYear(), 
                date.getMonth(), 
                date.getDate(),
                range.to.hours,
                range.to.minutes);
    
                model.surveyParticipationTimeSlots.push({
                    start: new Date(dateFrom),
                    finish: new Date(dateTo)
                })
            })
        })
    
        return model;
    };