import { delay, map, Observable, of, throwError } from "rxjs";
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

        return this.get<any>(`/api/surveyresponses/results`, filterMap)
        .pipe<SurveyResultEntry[]>(map(res => res.map((single: any) => ({
            surveyName: single.surveyName,
            question: single.question,
            responseDate: single.responseDate,
            answers: single.answers,
            respondentId: single.respondentId,
            longitude: single.localizationData?.longitude,
            latitude: single.localizationData?.latitude,
            outsideResearchArea: single.localizationData?.outsideResearchArea,
            temperature: single.sensorData?.temperature,
            humidity: single.sensorData?.humidity,
            accuracyMeters: single.localizationData?.accuracyMeters
        }))));
    }
}
