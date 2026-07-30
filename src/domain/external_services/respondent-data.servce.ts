import { Observable } from "rxjs";
import { RespondentInfoCollections } from "../models/respondent-info";
import { RespondentData, RespondentFilters } from "../models/respondent-data";
import {
  AssignSurveyWindowRequest,
  AssignSurveyWindowResponse,
  SurveyWindowActivityPoint,
} from "../models/survey-window";

export interface RespondentDataService{
    getRespondentInfoCollections(): Observable<RespondentInfoCollections>;
    getRespondents(filters: RespondentFilters | undefined): Observable<RespondentData[]>;
    assignSurveyWindow(body: AssignSurveyWindowRequest): Observable<AssignSurveyWindowResponse>;
    getSurveyWindowActivity(): Observable<SurveyWindowActivityPoint[]>;
}