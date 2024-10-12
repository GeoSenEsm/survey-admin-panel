import { delay, Observable, of, throwError } from "rxjs";
import { SummariesService } from "../../domain/external_services/summaries.service";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";
import { SurveyResultEntry } from "../../domain/models/survey-result-entry";
import { SurveyResultsFilter } from "../../domain/models/survey-results-filter";

@Injectable()
export class SummariesServiceImpl
extends ApiService
implements SummariesService {
    constructor(client: HttpClient, configService: ConfigService) {
        super(client, configService);
    }

    getTableResults(filter: SurveyResultsFilter): Observable<SurveyResultEntry[]> {
        return of([
            { surveyName: 'test', question: 'test', responseDate: '2024-01-01T12:00Z', answers: [1, 2, 3], respondentId: 'test' }
        ])
        return this.get(`api/surveyresponses/results`, {
            'surveyId': filter.surveyId,
            'dateFrom': filter.fromDate.toISOString(),
            'dateTo': filter.toDate.toISOString()
        })
    }
}