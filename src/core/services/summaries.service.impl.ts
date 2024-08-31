import { Observable } from "rxjs";
import { SummariesService } from "../../domain/external_services/summaries.service";
import { HistogramDataDto } from "../../domain/models/histogram.data.dto";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";

@Injectable()
export class SummariesServiceImpl
extends ApiService
implements SummariesService {
    constructor(client: HttpClient, configService: ConfigService) {
        super(client, configService);
    }

    getHistogramData(surveyId: string, date: Date): Observable<HistogramDataDto[]> {
        return this.get<HistogramDataDto[]>('/api/summaries/histogram', {
            'surveyId': surveyId,
            'date': date.toISOString()
        });
    }
}