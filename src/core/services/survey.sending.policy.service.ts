import { Observable } from "rxjs";
import { SurveySendingPolicyService } from "../../domain/external_services/survey.sending.policy.service";
import { CreateSurveySendingPolicyDto } from "../../domain/models/create.survey.sending.policy.dto";
import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class SurveySendingPolicyServiceImpl 
extends ApiService 
implements SurveySendingPolicyService{
    constructor(client: HttpClient){
        super(client);
    }

    createPolicy(dto: CreateSurveySendingPolicyDto): Observable<any> {
        return this.post('/api/surveysendingpolicies', dto);
    }

}