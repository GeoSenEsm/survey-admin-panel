import { Observable } from "rxjs";
import { SurveyResultsFilter } from "../models/survey-results-filter";
import { SurveyResultEntry } from "../models/survey-result-entry";
import { HttpEvent } from "@angular/common/http";

export interface SummariesService{
    getTableResultsWithProgress(filter: SurveyResultsFilter): Observable<HttpEvent<any>>;
}
