import { Observable } from "rxjs";
import { SurveyService } from "../../domain/external_services/survey.service";
import { CreateSurveyDto } from "../../domain/models/create.survey.dto";
import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SurveyDto } from "../../domain/models/survey.dto";

@Injectable({
    providedIn: 'root'
})
export class SurveyServiceImpl extends ApiService implements SurveyService{
    constructor(client: HttpClient) {
        super(client);
      }
    getAllShort(): Observable<SurveyDto[]> {
        return this.get<SurveyDto[]>("api/surveys/short");
    }

    createSurvey(dto: CreateSurveyDto): Observable<any> {
       return this.post('api/surveys', dto);
    }

}