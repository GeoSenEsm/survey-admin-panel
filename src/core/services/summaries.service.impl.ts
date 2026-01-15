import { delay, map, Observable, of, throwError } from "rxjs";
import { SummariesService } from "../../domain/external_services/summaries.service";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
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

    getTableResultsWithProgress(filter: SurveyResultsFilter): Observable<HttpEvent<any>> {
        const filterMap: any = {
            'surveyId': filter.surveyId,
            'dateFrom': filter.fromDate.toISOString(),
            'dateTo': filter.toDate.toISOString()
        };

        if (filter.respondentId) {
            filterMap['respondentId'] = filter.respondentId;
        }

        if (filter.outsideResearchArea !== undefined) {
            filterMap['outsideResearchArea'] = filter.outsideResearchArea
        }

        return this.getWithProgress<any>(`/api/surveyresponses/results`, filterMap);
    }
}
