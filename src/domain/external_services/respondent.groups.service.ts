import { Observable } from "rxjs";
import { RespondentsGroupDto } from "../models/respondents.group.dto";

export interface RespondentGroupsService{
    getRespondentsGroups(): Observable<RespondentsGroupDto[]>
}