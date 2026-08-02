import { TimeRange } from "../../core/models/time-range";
import { CreateSurveyParticipationTimeSlotDto } from "./create-survey-participation-time-slot-dto";

export interface CreateSurveySendingPolicyDto{
    surveyId: string;
    surveyParticipationTimeSlots: CreateSurveyParticipationTimeSlotDto[];
}

/**
 * Builds study wall-clock slots. The LocalDateTime face is the schedule
 * (hours of the study day); it is serialized with a fixed +00:00 offset so
 * the API stores the intended clock face rather than the admin browser TZ.
 */
export const crossDatesAndTimes = (surveyId: string, dates: Date[], timeRanges: TimeRange[]) => 
    {
        const model: CreateSurveySendingPolicyDto = {
            surveyId: surveyId,
            surveyParticipationTimeSlots: []
        }
    
        dates.forEach(date => {
            timeRanges.forEach(range => {
                const y = date.getFullYear();
                const m = date.getMonth();
                const d = date.getDate();
                model.surveyParticipationTimeSlots.push({
                    start: wallClockAsUtcDate(y, m, d, range.from.hours, range.from.minutes),
                    finish: wallClockAsUtcDate(y, m, d, range.to.hours, range.to.minutes)
                })
            })
        })
    
        return model;
    };

function wallClockAsUtcDate(
    year: number,
    monthIndex: number,
    day: number,
    hours: number,
    minutes: number
): Date {
    return new Date(Date.UTC(year, monthIndex, day, hours, minutes, 0, 0));
}
