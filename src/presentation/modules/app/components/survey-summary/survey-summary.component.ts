import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HistogramDataDto } from '../../../../../domain/models/histogram.data.dto';
import { SummariesService } from '../../../../../domain/external_services/summaries.service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-survey-summary',
  templateUrl: './survey-summary.component.html',
  styleUrl: './survey-summary.component.css'
})
export class SurveySummaryComponent implements OnInit{
  surveyId: string | null = null;
  date: Date | null = null;
  histograms: HistogramDataDto[] = [];
  private isBusy: boolean = false;

  constructor(private readonly route: ActivatedRoute,
    @Inject('summariesService')private readonly service: SummariesService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService){} 

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
    this.route.queryParams.subscribe(params => {
      const dateISO = params['date'];
      if (dateISO) {
        this.date = new Date(dateISO);
      }
      this.tryLoadHistograms();
    });
  }
  tryLoadHistograms(): void {
    if (this.surveyId == null || this.date == null
      || this.isBusy) {
      return;
    }

    this.isBusy = true;
    this.service.getHistogramData(this.surveyId, this.date)
      .pipe(
        catchError(error =>{
          this.snackbar.open(
            this.translate.instant('summary.surveySummary.couldNotLoadData'), 
            this.translate.instant('summary.surveySummary.ok'), 
            {duration: 3000}
          );
          //TODO: Change this error to something more specyfic
          return throwError(() => Error('Error'));
        }),
        finalize(() => this.isBusy = false)
      ).subscribe({
        next:histograms => {
          this.histograms = histograms;
        }
      });
  }
}
