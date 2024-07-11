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
export class SurveysListResultsComponent implements OnInit{
  surveys: SurveySummaryShortDto[] = [];
  private isBusy: boolean = false;

  constructor(@Inject('surveyService')private readonly service: SurveyService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService){}
  
  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    if (this.isBusy){
      return;
    }

    this.isBusy = true;
    this.service
    .getAllSummaryShort()
    .pipe(
      catchError((error) => {
        this.snackbar.open(
           this.translate.instant('surveyDetails.surveysList.couldNotLoadSurveys'),
           this.translate.instant('surveyDetails.surveysList.ok'),
            {duration: 3000}
          );
        return throwError(() => new Error(error));
      }),
      finalize(() => this.isBusy = false)
    ).subscribe({
      next: res => {
        this.surveys = res;
      }
    });
  }
}
