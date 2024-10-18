import { InjectionToken } from "@angular/core";
import { LocalStorageService } from "./local-storage";
import { START_SURVEY_SERVICE, STORAGE_SERVICE, TOKEN_HANDLER } from "./registration-names";
import { TokenHandler } from "./token-handler";
import { StartSurveyService } from "../../domain/external_services/start-survey.service";

export const STORAGE_SERVICE_TOKEN: InjectionToken<LocalStorageService>
= new InjectionToken<LocalStorageService>(STORAGE_SERVICE);

export const TOKEN_HANDLER_TOKEN: InjectionToken<TokenHandler>
= new InjectionToken<TokenHandler>(TOKEN_HANDLER);

export const START_SURVEY_SERVICE_TOKEN: InjectionToken<StartSurveyService>
 = new InjectionToken<StartSurveyService>(START_SURVEY_SERVICE)