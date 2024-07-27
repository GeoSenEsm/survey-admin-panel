import { NgModule } from '@angular/core';
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
import { HttpClient, HttpClientModule } from '@angular/common/http';
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


export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'respondents', component: RespondentsComponent},
    {path: '', component: RespondentsComponent},
    {path: 'surveys', component: SurveysComponent},
    {path: 'surveys/new', component: CreateSurveyComponent},
    {path: 'surveys/:surveyId', component: SurveyDetailsComponent},
    {path: 'summaries/:surveyId', component: SurveySummaryComponent},
    {path: 'summaries', component: SurveysListResultsComponent}
];

export const POLISH_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

export function HttpLoaderFactory(http: HttpClient){
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
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
    SurveySummaryTileComponent
    ],
  bootstrap: [AppComponent],
  providers: [
    provideAnimationsAsync(),
    {provide: 'dialog', useClass: MatDialog},
    {provide: 'surveyMapper', useClass: CreateSurveyMapper},
    {provide: 'surveyService', useClass: SurveyServiceImpl},
    {provide: 'respondentGroupsService', useClass: RespondentGroupsServiceImpl},
    { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' },
    { provide: MAT_DATE_FORMATS, useValue: POLISH_DATE_FORMATS },
    {provide: 'createSurveySendingPolicyMapper', useClass: CreateSurveySendingPolicyMapper},
    {provide: 'surveySendingPolicyService', useClass: SurveySendingPolicyServiceImpl},
    {provide: 'summariesService', useClass: SummariesServiceImpl},
    {provide: 'respondentDataService', useClass: RespondentDataServiceImpl}
  ],
})
export class AppModule {}
