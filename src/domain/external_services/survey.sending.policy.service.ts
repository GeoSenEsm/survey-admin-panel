import { Observable } from "rxjs";
import { CreateSurveySendingPolicyDto } from "../models/create.survey.sending.policy.dto";

export interface SurveySendingPolicyService{
    //TO DO: change returned any type to something better
    createPolicy(dto: CreateSurveySendingPolicyDto): Observable<any>
}