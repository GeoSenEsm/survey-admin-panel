import { delay, Observable, of } from "rxjs";
import { StartSurveyService } from "../../domain/external_services/start-survey.service";
import { StartSurveyQuestion } from "../models/start-survey-question";
import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";

@Injectable({
    providedIn: 'root'
})
export class StartSurveyServiceImpl 
extends ApiService
implements StartSurveyService{
    constructor(client: HttpClient, configService: ConfigService){
        super(client, configService);
    }

    getStartSurveyQuestions(): Observable<StartSurveyQuestion[]> {
        return this.get('/api/startSurveyQuestions');
    }
    addStartSurveyQuestions(newQuestions: StartSurveyQuestion[]): Observable<any> {
        return this.post('/api/startSurveyQuestions', newQuestions);
    }
}