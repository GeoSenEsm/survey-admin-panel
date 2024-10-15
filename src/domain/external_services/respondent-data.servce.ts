import { Observable } from "rxjs";
import { RespondentInfoCollections } from "../models/respondent-info";
import { RespondentData } from "../models/respondent-data";

export interface RespondentDataService{
    getRespondentInfoCollections(): Observable<RespondentInfoCollections>;
    getRespondents(): Observable<RespondentData[]>;
}