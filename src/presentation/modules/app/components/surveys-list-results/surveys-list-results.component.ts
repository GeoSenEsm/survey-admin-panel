import { Component, Inject, OnInit } from '@angular/core';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-surveys-list-results',
  templateUrl: './surveys-list-results.component.html',
  styleUrl: './surveys-list-results.component.css'
})
export class SurveysListResultsComponent implements OnInit{
  surveys: SurveySummaryShortDto[] = [];
  private isBusy: boolean = false;

  constructor(@Inject('surveyService')private readonly service: SurveyService,
    private readonly snackbar: MatSnackBar){}
  
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
        this.snackbar.open('Nie udało się załadować ankiet', 'OK', {duration: 3000});
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
