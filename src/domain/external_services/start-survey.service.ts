import { Observable } from "rxjs";
import { StartSurveyQuestion } from "../../core/models/start-survey-question";

export interface StartSurveyService{
    getStartSurveyQuestions(): Observable<StartSurveyQuestion[]>;
    addStartSurveyQuestions(newQuestions: StartSurveyQuestion[]): Observable<any>;
}