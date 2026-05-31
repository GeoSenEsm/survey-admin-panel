import { TimeRange } from "../../core/models/time-range";
import { combineToLocalDate } from "../../core/utils/combine-date-and-time";
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
                const dateFrom = combineToLocalDate(date, range.from);
                const dateTo = combineToLocalDate(date, range.to);

                model.surveyParticipationTimeSlots.push({
                    start: dateFrom,
                    finish: dateTo
                })
            })
        })

        return model;
    };
