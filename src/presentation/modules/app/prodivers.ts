import { APP_INITIALIZER, EnvironmentProviders, LOCALE_ID, Provider } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CreateSurveyMapper } from "../../../core/mappers/create.survey.mapper";
import { SurveyServiceImpl } from "../../../core/services/survey.service.impl";
import { RespondentGroupsServiceImpl } from "../../../core/services/respondent.groups.service.impl";
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { ENGLISH_DATE_FORMATS } from "./date.formats";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { CreateSurveySendingPolicyMapper } from "../../../core/mappers/create.survey.sending.policy.mapper";
import { SurveySendingPolicyServiceImpl } from "../../../core/services/survey.sending.policy.service.impl";
import { SummariesServiceImpl } from "../../../core/services/summaries.service.impl";
import { RespondentDataServiceImpl } from "../../../core/services/respondent.data.service.impl";
import { CookieStorageService } from "../../../core/services/local-storage";
import { STORAGE_SERVICE_TOKEN, TOKEN_HANDLER_TOKEN } from "../../../core/services/injection-tokens";
import { ConfigService } from "../../../core/services/config.service";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { LanguageInterceptor } from "../../../core/services/language-interceptor";
import { AUTHENTICATION_SERVICE, SUMMARIES_SERVICE, SURVEY_DETAILS_MAPPER } from "../../../core/services/registration-names";
import { SurveyDetailsMapper } from "../../../core/mappers/survey-details-mapper";
import { AuthenticationServiceImpl } from "../../../core/services/authentication.service";
import { JwtTokenHandler } from "../../../core/services/token-handler";
import { AuthInterceptor } from "../../../core/services/auth-interceptor";

function initializeApp(configService: ConfigService): () => Promise<any> {
    return () => configService.loadConfig();
}

export const APP_MODULE_PROVIDERS: (Provider | EnvironmentProviders)[] = [
    provideAnimationsAsync(),
    {provide: 'dialog', useClass: MatDialog},
    {provide: 'surveyMapper', useClass: CreateSurveyMapper},
    {provide: 'surveyService', useClass: SurveyServiceImpl},
    {provide: 'respondentGroupsService', useClass: RespondentGroupsServiceImpl},
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: ENGLISH_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'en' },
    {provide: 'createSurveySendingPolicyMapper', useClass: CreateSurveySendingPolicyMapper},
    {provide: 'surveySendingPolicyService', useClass: SurveySendingPolicyServiceImpl},
    {provide: SUMMARIES_SERVICE, useClass: SummariesServiceImpl},
    {provide: 'respondentDataService', useClass: RespondentDataServiceImpl},
    {provide: STORAGE_SERVICE_TOKEN, useClass: CookieStorageService},
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LanguageInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: SURVEY_DETAILS_MAPPER,
      useClass: SurveyDetailsMapper
    },
    {
      provide: AUTHENTICATION_SERVICE,
      useClass: AuthenticationServiceImpl
    },
    {
      provide: TOKEN_HANDLER_TOKEN,
      useClass: JwtTokenHandler
    }
]