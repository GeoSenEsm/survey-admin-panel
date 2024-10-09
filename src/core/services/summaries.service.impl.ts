import { Observable, of } from "rxjs";
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
        return of<SurveyResultEntry[]>([
            {
                surveyName:  "Jakaś ankieta",
                question: "Pytanie",
                responseDate: new Date(),
                answers: ["Odpowiedzi"],
                respondentId: "Identyfikator respondenta"
            },
            {
                surveyName:  "Jakaś ankieta",
                question: "Pytanie 2",
                responseDate: new Date(),
                answers: [1, 2, 3],
                respondentId: "Identyfikator respondenta 2"
            }
        ]);
    }
}