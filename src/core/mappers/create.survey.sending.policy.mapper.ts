import { Injectable } from "@angular/core";
import { Mapper } from "./mapper";
import { CreateSurveySendingPolicyModel } from "../models/create.survey.sending.policy.model";
import { CreateSurveySendingPolicyDto } from "../../domain/models/create.survey.sending.policy.dto";

@Injectable()
export class CreateSurveySendingPolicyMapper 
implements Mapper<CreateSurveySendingPolicyModel, 
CreateSurveySendingPolicyDto> {
    map(source: CreateSurveySendingPolicyModel): CreateSurveySendingPolicyDto {
        const destination: CreateSurveySendingPolicyDto = {
            surveyId: source.surveyId,
            surveyParticipationTimeSlots: []
        }

        source.dates.forEach(date => {
            let startDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
        
            let finishDate = new Date(date);
            finishDate.setUTCHours(23, 59, 0, 0);
        
            destination.surveyParticipationTimeSlots.push({
                start: startDate,
                finish: finishDate
            });
        });

        return destination;
    }  
}