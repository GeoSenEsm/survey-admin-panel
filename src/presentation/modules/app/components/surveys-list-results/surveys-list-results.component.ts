import { Component, Inject, OnInit } from '@angular/core';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-surveys-list-results',
  templateUrl: './surveys-list-results.component.html',
  styleUrl: './surveys-list-results.component.css'
})
export class SurveysListResultsComponent{
  surveys: SurveySummaryShortDto[] = [];
  

  constructor(){}
  
  
}
