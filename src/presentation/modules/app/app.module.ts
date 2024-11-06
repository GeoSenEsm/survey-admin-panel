import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './components/app/app.component';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
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
import { MatDialogModule } from '@angular/material/dialog';
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
import { OptionComponent } from './components/option/option.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { SurveyTileComponent } from './components/survey-tile/survey-tile.component';
import { SurveyDetailsComponent } from './components/survey-details/survey-details.component';
import {MatTabsModule} from '@angular/material/tabs';
import { SurveySendingPolicyComponent } from './components/survey-sending-policy/survey-sending-policy.component';
import { CreateSurveySendingPolicyComponent } from './components/create-survey-sending-policy/create-survey-sending-policy.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMultipleDatesModule } from 'ngx-multiple-dates';
import { FullCalendarModule } from '@fullcalendar/angular';
import { HistogramComponent } from './components/histogram/histogram.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { SurveysListResultsComponent } from './components/surveys-list-results/surveys-list-results.component';
import { SurveySummaryTileComponent } from './components/survey-summary-tile/survey-summary-tile.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from './components/loading/loading.component';
import { laodingComponentGuard, tokenAvailableGuard } from '../../../core/guards/auth-guard';
import { MatMenuModule } from '@angular/material/menu';
import { APP_MODULE_PROVIDERS } from './prodivers';
import { SurveyPreviewComponent } from './components/survey-preview/survey-preview.component';
import { ResultsFiltersComponent } from './components/results-filters/results-filters.component';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CommonModule } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import { StartSurveyComponent } from './components/start-survey/start-survey.component';
import { StartSurveyQuestionComponent } from './components/start-survey-question/start-survey-question.component';
import { TypeToConfirmDialogComponent } from './components/type-to-confirm-dialog/type-to-confirm-dialog.component';
import { StartSurveyQuestionOptionComponent } from './components/start-survey-question-option/start-survey-question-option.component';
import { TimeRangesComponent } from './components/time-ranges/time-ranges.component';
import { SingleTimeRangeComponent } from './components/single-time-range/single-time-range.component';
import { TempratureDataComponent } from './components/temprature-data/temprature-data.component';
import { TemperatureDataFiltersComponent } from './components/temperature-data-filters/temperature-data-filters.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapComponent } from './components/map/map.component';
import { MapFiltersComponent } from './components/map-filters/map-filters.component';
import { MapPinTooltipComponent } from './components/map-pin-tooltip/map-pin-tooltip.component';


export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'respondents', component: RespondentsComponent, canActivate: [tokenAvailableGuard]},
    {path: '', component: LoadingComponent, canActivate: [laodingComponentGuard]},
    {path: 'surveys', component: SurveysComponent, canActivate: [tokenAvailableGuard]},
    {path: 'surveys/new', component: CreateSurveyComponent, canActivate: [tokenAvailableGuard]},
    {path: 'surveys/:surveyId', component: SurveyDetailsComponent, canActivate: [tokenAvailableGuard]},
    {path: 'summaries', component: SurveysListResultsComponent, canActivate: [tokenAvailableGuard]},
    {path: 'startSurvey', component: StartSurveyComponent, canActivate: [tokenAvailableGuard]},
    {path: 'temperature', component: TempratureDataComponent, canActivate: [tokenAvailableGuard]},
    {path: 'map', component: MapComponent, canActivate: [tokenAvailableGuard]},
];

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
    MatProgressSpinnerModule,
    MatMenuModule,
    NgxMatTimepickerModule,
    CommonModule,
    MatExpansionModule,
    MatTooltipModule
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
    HistogramComponent,
    SurveysListResultsComponent,
    SurveySummaryTileComponent,
    SurveyPreviewComponent,
    LoadingComponent,
    ResultsFiltersComponent,
    StartSurveyComponent,
    StartSurveyQuestionComponent,
    TypeToConfirmDialogComponent,
    StartSurveyQuestionOptionComponent,
    TimeRangesComponent,
    SingleTimeRangeComponent,
    TempratureDataComponent,
    TemperatureDataFiltersComponent,
    MapComponent,
    MapFiltersComponent,
    MapPinTooltipComponent
    ],
  bootstrap: [AppComponent],
  providers: APP_MODULE_PROVIDERS,
})
export class AppModule {

}