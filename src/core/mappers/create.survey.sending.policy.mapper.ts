import { Injectable } from "@angular/core";
import { Mapper } from "./mapper";
import { CreateSurveySendingPolicyModel } from "../models/create.survey.sending.policy.model";
import { CreateSurveySendingPolicyDto } from "../../domain/models/create.survey.sending.policy.dto";
import { TimeUnit } from "../models/time.unit";

@Injectable()
export class CreateSurveySendingPolicyMapper 
implements Mapper<CreateSurveySendingPolicyModel, 
CreateSurveySendingPolicyDto> {
    map(source: CreateSurveySendingPolicyModel): CreateSurveySendingPolicyDto {
        const destination: CreateSurveySendingPolicyDto = {
            surveyId: source.surveyId,
            surveyParticipationTimeSlots: []
        };
        
        const step = this.getTimeUnitMilliseconds(source.repeatUnit!);

        let from = source.start!;
        do{
            const slotStart = new Date(from);
            slotStart.setHours(0, 0, 0, 0);
            const slotEnd = new Date(from);
            slotEnd.setHours(23, 59, 59, 999);
            from = new Date(from.getTime() + step);
            destination.surveyParticipationTimeSlots
            .push({
                dateFrom: slotStart, 
                dateTo: slotEnd
            });
        } while(from <= source.end!);

        return destination;
    }

    getTimeUnitMilliseconds(timeUnit: TimeUnit): number {
        switch (timeUnit) {
            case TimeUnit.Day:
                return 24 * 60 * 60 * 1000;
            case TimeUnit.Week:
                return 7 * 24 * 60 * 60 * 1000;
        }
    }
}