import { AfterContentInit, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, Subscription, throwError } from 'rxjs';
import { SurveyResultsFilter } from '../../../../../domain/models/survey-results-filter';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { adjustDateRange } from '../../../../../core/utils/adjust-date-range';
import { parseToTime } from '../../../../../core/utils/parsers';

@Component({
  selector: 'app-results-filters',
  templateUrl: './results-filters.component.html',
  styleUrl: './results-filters.component.scss'
})
export class ResultsFiltersComponent implements OnInit, OnDestroy{
  @Output()
  loadDataCallback = new EventEmitter<SurveyResultsFilter>();
  @Output()
  exportDataCallback = new EventEmitter();
  @Input()
  surveys: SurveySummaryShortDto[] | undefined = undefined;
  @Input()
  canExport: boolean = false;
  filtersForm: FormGroup;
  private isBusy: boolean = false;
  subscriptionsToDisposeOnDestroy: (Subscription | undefined)[] = [];

  constructor(@Inject('surveyService')private readonly service: SurveyService,
  private readonly snackbar: MatSnackBar,
  private readonly translate: TranslateService,
  formBuilder: FormBuilder){
    this.filtersForm = formBuilder.group({
      selectedSurveyId: new FormControl<string | undefined>(undefined), 
      selectedDateFrom: [new Date()],
      selectedTimeFrom: ['7:00'],
      selectedDateTo: [new Date()],
      selectedTimeTo: ['20:00']
    });
  }
  ngOnDestroy(): void {
    this.subscriptionsToDisposeOnDestroy.forEach(sub => sub?.unsubscribe());
  }


  ngOnInit(): void {
    this.loadSurveys();
    this.subscriptionsToDisposeOnDestroy = [
      this.filtersForm.get('selectedDateFrom')?.valueChanges.subscribe(() => {
        this.adjustToToFrom();
      }),
      this.filtersForm.get('selectedTimeFrom')?.valueChanges.subscribe(() => {
        this.adjustToToFrom();
      }),
      this.filtersForm.get('selectedDateTo')?.valueChanges.subscribe(() => {
        this.adjustFromToTo();
      }),
      this.filtersForm.get('selectedTimeTo')?.valueChanges.subscribe(() => {
        this.adjustFromToTo();
      }),
    ];
  }

  private adjustToToFrom(): void{
    adjustDateRange(this.filtersForm.get('selectedDateFrom')?.value,
      parseToTime(this.filtersForm.get('selectedTimeFrom')?.value),
      this.filtersForm.get('selectedDateTo')?.value,
      parseToTime(this.filtersForm.get('selectedTimeTo')?.value),
      'from', (newDate) => {
        this.filtersForm.get('selectedDateTo')?.setValue(newDate);
      });
  }

  private adjustFromToTo(): void{
    adjustDateRange(this.filtersForm.get('selectedDateFrom')?.value,
      parseToTime(this.filtersForm.get('selectedTimeFrom')?.value),
      this.filtersForm.get('selectedDateTo')?.value,
      parseToTime(this.filtersForm.get('selectedTimeTo')?.value),
      'to', (newDate) => {
        this.filtersForm.get('selectedDateFrom')?.setValue(newDate);
      });
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
      const timeFrom = 
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
