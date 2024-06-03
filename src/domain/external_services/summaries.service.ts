import { Observable } from "rxjs";
import { HistogramDataDto } from "../models/histogram.data.dto";

export interface SummariesService{
    getHistogramData(surveyId: string): Observable<HistogramDataDto[]>;
}