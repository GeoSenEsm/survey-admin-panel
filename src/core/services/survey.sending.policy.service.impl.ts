import { Observable } from "rxjs";
import { SurveySendingPolicyService } from "../../domain/external_services/survey.sending.policy.service";
import { CreateSurveySendingPolicyDto } from "../../domain/models/create-survey-sending-policy-dto";
import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SurveySendingPolicyDto } from "../../domain/models/survey.sending.policy.dto";
import { ConfigService } from "./config.service";

@Injectable()
export class SurveySendingPolicyServiceImpl 
extends ApiService 
implements SurveySendingPolicyService{
    constructor(client: HttpClient, confgiService: ConfigService) {
        super(client, confgiService);
    }
    getAll(surveyId: string): Observable<SurveySendingPolicyDto[]> {
        return this.get(`/api/surveysendingpolicies`, {
            'surveyId': surveyId
        });
    }

    createPolicy(dto: CreateSurveySendingPolicyDto): Observable<SurveySendingPolicyDto> {
        return this.post('/api/surveysendingpolicies', dto);
    }
    
}