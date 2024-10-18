import { Observable } from "rxjs";
import { SurveyResultsFilter } from "../models/survey-results-filter";
import { SurveyResultEntry } from "../models/survey-result-entry";

export interface SummariesService{
    getTableResults(filter: SurveyResultsFilter): Observable<SurveyResultEntry[]>;
}