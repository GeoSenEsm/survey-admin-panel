import { forkJoin, map, Observable, of } from "rxjs";
import { RespondentDataService } from "../../domain/external_services/respondent-data.servce";
import { RespondentData, RespondentFilters } from "../../domain/models/respondent-data";
import { RespondentInfo, RespondentInfoCollections } from "../../domain/models/respondent-info";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiService } from "./api.service";
import { ConfigService } from "./config.service";
import { StartSurveyQuestion } from "../models/start-survey-question";

@Injectable()
export class RespondentDataServiceImpl 
extends ApiService 
implements RespondentDataService{
    constructor(client: HttpClient, configService: ConfigService){
        super(client, configService);
    }

    getRespondentInfoCollections(): Observable<RespondentInfoCollections> {
        return this.get<StartSurveyQuestion[]>('/api/initialsurvey')
        .pipe(
            map(questions =>{
                const result: RespondentInfoCollections = {};
                questions.forEach(q => {
                    result[q.content] = q.options.map(o => {
                        const info: RespondentInfo = {
                            id: o.id!,
                            display: o.content
                        };
                        return info;
                    });
                });
                return result;
            })
        );
    }

    getRespondents(filters: RespondentFilters | undefined): Observable<RespondentData[]> {
        if (filters && filters.filterOption){
            this.get('/api/respondents/all', {
                'filterOption': filters.filterOption,
                'amount': filters.amount,
                'from': filters.from.toISOString(),
                'to': filters.to.toISOString()
            });
        }
        return this.get('/api/respondents/all');
    }
    
}