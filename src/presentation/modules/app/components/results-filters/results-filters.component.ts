import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, throwError } from 'rxjs';
import { SurveyResultsFilter } from '../../../../../domain/models/survey-results-filter';
import { FormControl, FormGroup } from '@angular/forms';
import { Time } from '@angular/common';

@Component({
  selector: 'app-results-filters',
  templateUrl: './results-filters.component.html',
  styleUrl: './results-filters.component.scss'
})
export class ResultsFiltersComponent implements OnInit{
  @Output()
  loadDataCallback = new EventEmitter<SurveyResultsFilter>();
  @Output()
  exportDataCallback = new EventEmitter();
  @Input()
  surveys: SurveySummaryShortDto[] | undefined = undefined;
  @Input()
  canExport: boolean = false;
  filtersForm = new FormGroup({
    selectedSurveyId: new FormControl<string | undefined>(undefined), 
    selectedDateFrom: new FormControl<Date | undefined>(undefined),
    selectedTimeFrom: new FormControl<Time | undefined>(undefined),
    selectedDateTo: new FormControl<Date | undefined>(undefined),
    selectedTimeTo: new FormControl<Time | undefined>(undefined)
  });
  private isBusy: boolean = false;

  constructor(@Inject('surveyService')private readonly service: SurveyService,
  private readonly snackbar: MatSnackBar,
  private readonly translate: TranslateService){
  }

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

  canLoad(): boolean{
    return notNullOrUndefined(this.filtersForm.value.selectedSurveyId) && notNullOrUndefined(this.filtersForm.value.selectedDateFrom)
      && notNullOrUndefined(this.filtersForm.value.selectedTimeFrom) && notNullOrUndefined(this.filtersForm.value.selectedDateTo)
      && notNullOrUndefined(this.filtersForm.value.selectedTimeTo);
  }

  loadData(): void{
    if (this.canLoad()){
      this.loadDataCallback.emit({
        surveyId: this.filtersForm.value.selectedSurveyId!,
        fromDate: this.filtersForm.value.selectedDateFrom!,
        toDate: this.filtersForm.value.selectedDateTo!
      });
    }
  }

  exportData(): void{
    this.exportDataCallback.emit();
  }
}

function notNullOrUndefined(obj: any){
  return obj !== null && obj !== undefined;
}
