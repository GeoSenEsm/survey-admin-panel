import { Observable } from "rxjs";
import { RespondentInfoCollections } from "../models/respondent-info";
import { RespondentData, RespondentFilters } from "../models/respondent-data";

export interface RespondentDataService{
    getRespondentInfoCollections(): Observable<RespondentInfoCollections>;
    getRespondents(filters: RespondentFilters | undefined): Observable<RespondentData[]>;
}