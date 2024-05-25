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
import { HttpClientModule } from '@angular/common/http';
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


export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'respondents', component: RespondentsComponent},
    {path: '', component: RespondentsComponent},
    {path: 'surveys', component: SurveysComponent},
    {path: 'surveys/new', component: CreateSurveyComponent}
];

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
    ClipboardModule
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
    OptionComponent
    ],
  bootstrap: [AppComponent],
  providers: [
    provideAnimationsAsync(),
    {provide: 'dialog', useClass: MatDialog},
    {provide: 'surveyMapper', useClass: CreateSurveyMapper},
    {provide: 'surveyService', useClass: SurveyServiceImpl}
  ],
})
export class AppModule {}
