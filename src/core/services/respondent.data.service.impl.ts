import { forkJoin, map, Observable } from "rxjs";
import { RespondentDataService } from "../../domain/external_services/respondent.data.servce";
import { RespondentData } from "../../domain/models/respondent.data";
import { RespondentInfoCollections } from "../../domain/models/respondent.info";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiService } from "./api.service";

@Injectable()
export class RespondentDataServiceImpl 
extends ApiService 
implements RespondentDataService{
    private readonly infoEndpoints = [
        'agecategories',
        'occupationcategories',
        'educationcategories',
        'greeneryareacategories',
        'medicationuse',
        'healthconditions',
        'stresslevels',
        'lifesatisfaction',
        'qualityofsleep'
    ]

    constructor(client: HttpClient){
        super(client);
    }

    getRespondentInfoCollections(): Observable<RespondentInfoCollections> {
        const pipes = this.infoEndpoints.map(e => {
            return this.get(`/api/${e}`)
        });

        return forkJoin(pipes).pipe(
            map(responses => {
                return {
                  ageCategories: responses[0],
                  occupationCategories: responses[1],
                  educationCategories: responses[2],
                  greeneryAreaCategories: responses[3],
                  medicationUses: responses[4],
                  healthConditions: responses[5],
                  stressLevels: responses[6],
                  lifeSatisfactions: responses[7],
                  qualityOfSleeps: responses[8]
                } as RespondentInfoCollections;
              })
        )
    }

    getRespondents(): Observable<RespondentData[]> {
        return this.get('/api/respondents/all');
    }
    
}