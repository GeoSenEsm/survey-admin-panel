import { Observable } from "rxjs";
import { RespondentInfoCollections } from "../models/respondent-info";
import { RespondentData, RespondentFilters } from "../models/respondent-data";
import { ChangePasswordDto } from "../models/change-password-dto";

export interface RespondentDataService{
    getRespondentInfoCollections(): Observable<RespondentInfoCollections>;
    getRespondents(filters: RespondentFilters | undefined): Observable<RespondentData[]>;
    updatePassword(redpondentId: string, dto: ChangePasswordDto): Observable<any>;
}