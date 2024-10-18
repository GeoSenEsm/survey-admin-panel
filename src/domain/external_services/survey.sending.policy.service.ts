import { Observable } from "rxjs";
import { CreateSurveySendingPolicyDto } from "../models/create-survey-sending-policy-dto";
import { SurveySendingPolicyDto } from "../models/survey.sending.policy.dto";

export interface SurveySendingPolicyService{
    createPolicy(dto: CreateSurveySendingPolicyDto): Observable<SurveySendingPolicyDto>
    getAll(surveyId: string): Observable<SurveySendingPolicyDto[]>;
}