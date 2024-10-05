import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './components/app/app.component';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RespondentsComponent } from './components/respondents/respondents.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOptionModule } from '@angular/material/core';
import { AddRespondentsComponent } from './components/add-respondents/add-respondents.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SurveysComponent } from './components/surveys/surveys.component';
import { ButtonsRibbonComponent } from './components/buttons.ribbon/buttons.ribbon.component';
import { CreateSurveyComponent } from './components/create-survey/create-survey.component';
import { CreateSectionComponent } from './components/create-section/create-section.component';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { CreateQuestionComponent } from './components/create-question/create-question.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CreateTextSelectionOptionsComponent } from './components/create-text-selection-options/create-text-selection-options.component';
import { CreateNumberRangeComponent } from './components/create-number-range/create-number-range.component';
import { CreateSurveyMapper } from '../../../core/mappers/create.survey.mapper';
import { SurveyServiceImpl } from '../../../core/services/survey.service.impl';
import { OptionComponent } from './components/option/option.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { SurveyTileComponent } from './components/survey-tile/survey-tile.component';
import { RespondentGroupsServiceImpl } from '../../../core/services/respondent.groups.service.impl';
import { SurveyDetailsComponent } from './components/survey-details/survey-details.component';
import {MatTabsModule} from '@angular/material/tabs';
import { SurveySendingPolicyComponent } from './components/survey-sending-policy/survey-sending-policy.component';
import { CreateSurveySendingPolicyComponent } from './components/create-survey-sending-policy/create-survey-sending-policy.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CreateSurveySendingPolicyMapper } from '../../../core/mappers/create.survey.sending.policy.mapper';
import { SurveySendingPolicyServiceImpl } from '../../../core/services/survey.sending.policy.service.impl';
import { NgxMultipleDatesModule } from 'ngx-multiple-dates';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SurveySummaryComponent } from './components/survey-summary/survey-summary.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { SummariesServiceImpl } from '../../../core/services/summaries.service.impl';
import { SurveysListResultsComponent } from './components/surveys-list-results/surveys-list-results.component';
import { SurveySummaryTileComponent } from './components/survey-summary-tile/survey-summary-tile.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RespondentDataServiceImpl } from '../../../core/services/respondent.data.service.impl';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ENGLISH_DATE_FORMATS } from './date.formats';
import { CookieStorageService } from '../../../core/services/local-storage';
import { ConfigService } from '../../../core/services/config.service';
import { LanguageInterceptor } from '../../../core/services/language.interceptor';
import { SurveyPreviewComponent } from './components/survey-preview/survey-preview.component';
import { STORAGE_SERVICE, SURVEY_DETAILS_MAPPER } from '../../../core/services/registration-names';
import { SurveyDetailsMapper } from '../../../core/mappers/survey-details-mapper';
import { LoadingComponent } from './components/loading/loading.component';
import { laodingComponentGuard, tokenAvailableGuard } from '../../../core/guards/auth-guard';
import { STORAGE_SERVICE_TOKEN } from '../../../core/services/injection-tokens';


export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'respondents', component: RespondentsComponent, canActivate: [tokenAvailableGuard]},
    {path: '', component: LoadingComponent, canActivate: [laodingComponentGuard]},
    {path: 'surveys', component: SurveysComponent, canActivate: [tokenAvailableGuard]},
    {path: 'surveys/new', component: CreateSurveyComponent, canActivate: [tokenAvailableGuard]},
    {path: 'surveys/:surveyId', component: SurveyDetailsComponent, canActivate: [tokenAvailableGuard]},
    {path: 'summaries/:surveyId', component: SurveySummaryComponent, canActivate: [tokenAvailableGuard]},
    {path: 'summaries', component: SurveysListResultsComponent, canActivate: [tokenAvailableGuard]}
];



export function HttpLoaderFactory(http: HttpClient){
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}
 
export function initializeApp(configService: ConfigService): () => Promise<any> {
  return () => configService.loadConfig();
}

@NgModule({
  imports: [
    BrowserModule,
    RouterOutlet,
    RouterModule.forRoot(routes),
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatOptionModule,
    MatDialogModule,
    MatCardModule,
    MatSelectModule,
    MatSlideToggleModule,
    HttpClientModule,
    ClipboardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMultipleDatesModule,
    MatTabsModule,
    MatGridListModule,
    FullCalendarModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MatProgressSpinnerModule
  ],
  declarations: [
    AppComponent, 
    LoginComponent, 
    DashboardComponent,
    RespondentsComponent, 
    AddRespondentsComponent,
    SurveysComponent,
    ButtonsRibbonComponent,
    CreateSurveyComponent,
    CreateSectionComponent,
    CreateQuestionComponent,
    CreateTextSelectionOptionsComponent,
    CreateNumberRangeComponent,
    OptionComponent,
    SurveyDetailsComponent,
    SurveySendingPolicyComponent,
    CreateSurveySendingPolicyComponent,
    SurveyTileComponent,
    SurveySummaryComponent,
    HistogramComponent,
    SurveysListResultsComponent,
    SurveySummaryTileComponent,
    SurveyPreviewComponent,
    LoadingComponent
    ],
  bootstrap: [AppComponent],
  providers: [
    provideAnimationsAsync(),
    {provide: 'dialog', useClass: MatDialog},
    {provide: 'surveyMapper', useClass: CreateSurveyMapper},
    {provide: 'surveyService', useClass: SurveyServiceImpl},
    {provide: 'respondentGroupsService', useClass: RespondentGroupsServiceImpl},
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: ENGLISH_DATE_FORMATS },
    {provide: 'createSurveySendingPolicyMapper', useClass: CreateSurveySendingPolicyMapper},
    {provide: 'surveySendingPolicyService', useClass: SurveySendingPolicyServiceImpl},
    {provide: 'summariesService', useClass: SummariesServiceImpl},
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
      provide: SURVEY_DETAILS_MAPPER,
      useClass: SurveyDetailsMapper
    }
  ],
})
export class AppModule {

}