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

    createSurvey(dto: CreateSurveyDto, images: File[]): Observable<any> {
        const formData = new FormData();
        formData.append('json', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
        console.log(dto);
        images.forEach(image => {
          formData.append('files', image, image.name);
        });

        return this.post('/api/surveys', formData);
    }

    getSurveyById(id: string): Observable<SurveyDetailsDto> {
        return this.get('/api/surveys', { surveyId: id });
    }

    update(dto: CreateSurveyDto, images: File[], id: string): Observable<any> {
        const formData = new FormData();
        formData.append('json', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
        console.log(dto);
        images.forEach(image => {
          formData.append('files', image, image.name);
        });
        return this.put(`/api/surveys/${id}`, formData);
    }

    publish(id: string): Observable<any> {
        return this.patch(`/api/surveys/publish`, { surveyId: id });
    }

    deleteSurvey(id: string): Observable<any> {
        return this.delete(`/api/surveys/${id}`);
    }
}