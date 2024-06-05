import { Observable } from "rxjs";
import { SummariesService } from "../../domain/external_services/summaries.service";
import { HistogramDataDto } from "../../domain/models/histogram.data.dto";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class SummariesServiceImpl
extends ApiService
implements SummariesService {
    constructor(client: HttpClient) {
        super(client);
    }

    getHistogramData(surveyId: string): Observable<HistogramDataDto[]> {
        return this.get<HistogramDataDto[]>('/api/summaries/histogram', {
            'surveyId': surveyId
        });
    }
}