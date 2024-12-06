import { delay, map, Observable, of } from "rxjs";
import { StartSurveyService } from "../../domain/external_services/start-survey.service";
import { InitialSurveyState, StartSurveyQuestion, StartSurveyResponse } from "../models/start-survey-question";
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
    update(respondentId: string, responses: StartSurveyResponse[]): Observable<any> {
        return this.put('/api/respondents', responses, { respondentId: respondentId });
    }

    getStartSurveyQuestions(): Observable<StartSurveyQuestion[]> {
        return this.get('/api/initialsurvey');
    }
    addStartSurveyQuestions(newQuestions: StartSurveyQuestion[]): Observable<any> {
        return this.post('/api/initialsurvey', newQuestions);
    }

    getState(): Observable<InitialSurveyState> {
        return this.get<any>('/api/initialsurvey/state')
        .pipe(
            map((res) => {
                return res.text as InitialSurveyState
            })
        );
    }

    publish(): Observable<any>{
        return this.patch('/api/initialsurvey/publish');
    }
}