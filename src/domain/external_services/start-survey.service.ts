import { Observable } from "rxjs";
import { StartSurveyQuestion, StartSurveyResponse } from "../../core/models/start-survey-question";

export interface StartSurveyService{
    getStartSurveyQuestions(): Observable<StartSurveyQuestion[]>;
    addStartSurveyQuestions(newQuestions: StartSurveyQuestion[]): Observable<any>;
    update(respondentId: string, responses: StartSurveyResponse[]): Observable<any>;
}