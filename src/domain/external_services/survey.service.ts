import { Observable } from "rxjs";
import { CreateSurveyDto } from "../models/create.survey.dto";
import { SurveyDto } from "../models/survey.dto";
import { SurveySummaryShortDto } from "../models/survey.summary.short.dto";
import { SurveyDetailsDto } from "../models/survey.details.dtos";
import { SurveyNotificationDto } from "../models/survey-notification.dto";

export interface SurveyService{
    //TO DO: this is of type any just temporary, has to be changed
    createSurvey(dto: CreateSurveyDto, images: File[]): Observable<any>;
    getAllShort(): Observable<SurveyDto[]>;
    getAllSummaryShort(): Observable<SurveySummaryShortDto[]>;
    getSurveyById(id: string): Observable<SurveyDetailsDto>;
    update(dto: CreateSurveyDto, images: (File | string)[], id: string): Observable<any>;
    publish(id: string): Observable<any>;
    deleteSurvey(id: string): Observable<any>;
    getNotifications(surveyId: string): Observable<SurveyNotificationDto[]>;
    replaceNotifications(surveyId: string, notifications: SurveyNotificationDto[]): Observable<SurveyNotificationDto[]>;
}