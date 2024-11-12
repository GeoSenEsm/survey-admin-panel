import { Observable } from "rxjs";
import { SurveyService } from "../../domain/external_services/survey.service";
import { CreateSurveyDto } from "../../domain/models/create.survey.dto";
import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SurveyDto } from "../../domain/models/survey.dto";
import { SurveySummaryShortDto } from "../../domain/models/survey.summary.short.dto";
import { ConfigService } from "./config.service";
import { SurveyDetailsDto } from "../../domain/models/survey.details.dtos";

@Injectable({
    providedIn: 'root'
})
export class SurveyServiceImpl extends ApiService implements SurveyService{
    constructor(client: HttpClient, configService: ConfigService) {
        super(client, configService);
      }
    getAllSummaryShort(): Observable<SurveySummaryShortDto[]> {
        return this.get<SurveySummaryShortDto[]>('/api/surveys/shortsummaries');
    }
    getAllShort(): Observable<SurveyDto[]> {
        return this.get<SurveyDto[]>("/api/surveys/short");
    }

    createSurvey(dto: CreateSurveyDto): Observable<any> {
        return this.postQuery('/api/surveys', { json: JSON.stringify(dto) });
    }

    getSurveyById(id: string): Observable<SurveyDetailsDto> {
        return this.get('/api/surveys', { surveyId: id });
    }
}