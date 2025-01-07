import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, Subscription, throwError } from 'rxjs';
import { SurveyResultsFilter } from '../../../../../domain/models/survey-results-filter';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { parseToTime } from '../../../../../core/utils/parsers';
import { DateAndTimeRangeService } from '../../../../../core/services/data-and-time-range.service';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { ActivatedRoute } from '@angular/router';
import { TimeFormatService } from '../../../../../core/services/time-format.service';

@Component({
  selector: 'app-results-filters',
  templateUrl: './results-filters.component.html',
  styleUrl: './results-filters.component.scss',
})
export class ResultsFiltersComponent implements OnInit, OnDestroy, OnDestroy, OnChanges {
  @Output()
  loadDataCallback = new EventEmitter<SurveyResultsFilter>();
  @Output()
  exportDataCallback = new EventEmitter();
  @Input()
  surveys: SurveySummaryShortDto[] | undefined = undefined;
  @Input()
  canExport: boolean = false;
  @Input()
  respondents: RespondentData[] = [];
  filtersForm: FormGroup;
  private isBusy: boolean = false;
  subscriptionsToDisposeOnDestroy: (Subscription | undefined)[] = [];

  constructor(
    @Inject('surveyService') private readonly service: SurveyService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    formBuilder: FormBuilder,
    private readonly dateAndTimeRangeService: DateAndTimeRangeService,
    private route: ActivatedRoute,
    public readonly timeFormatService: TimeFormatService
  ) {
    this.filtersForm = formBuilder.group({
      selectedSurveyId: new FormControl<string | undefined>(undefined),
      selectedRespondentName: [undefined, this.validateSelectedRespondent.bind(this)],
      selectedDateFrom: [new Date()],
      selectedTimeFrom: ['7:00'],
      selectedDateTo: [new Date()],
      selectedTimeTo: ['20:00'],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['respondents']) {
      this.filtersForm.get('selectedRespondentName')?.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.subscriptionsToDisposeOnDestroy.forEach((sub) => sub?.unsubscribe());
  }

  ngOnInit(): void {
    this.loadSurveys();
    this.subscriptionsToDisposeOnDestroy = [
      this.dateAndTimeRangeService.guardDates(
        this.filtersForm,
        'selectedDateFrom',
        'selectedTimeFrom',
        'selectedDateTo',
        'selectedTimeTo'
      ),
    ];
    this.listenToQueryParams();
  }
  
  
  listenToQueryParams() {
    const routeListener = this.route.queryParamMap.subscribe(params => {
      this.filtersForm.patchValue({ selectedRespondentName: params.get('respondent') });
    });

    this.subscriptionsToDisposeOnDestroy.push(routeListener);
  }

  loadSurveys(): void {
    if (this.isBusy) {
      return;
    }

    this.isBusy = true;

    this.service
      .getAllSummaryShort()
      .pipe(
        finalize(() => (this.isBusy = false))
      )
      .subscribe({
        next: (res) => {
          this.surveys = res;
          console.log(this.surveys);
        },
        error: (err) => {
          this.snackbar.open(
            this.translate.instant(
              'surveyDetails.surveysList.couldNotLoadSurveys'
            ),
            this.translate.instant('surveyDetails.surveysList.ok'),
            { duration: 3000 }
          );
        }
      });
  }

  canLoad(): boolean {
    return (
      this.filtersForm.valid &&
      notNullOrUndefined(this.filtersForm.value.selectedSurveyId) &&
      notNullOrUndefined(this.filtersForm.value.selectedDateFrom) &&
      notNullOrUndefined(this.filtersForm.value.selectedTimeFrom) &&
      notNullOrUndefined(this.filtersForm.value.selectedDateTo) &&
      notNullOrUndefined(this.filtersForm.value.selectedTimeTo)
    );
  }

  loadData(): void {
    if (this.canLoad()) {
      const timeFrom = parseToTime(
        this.filtersForm.get('selectedTimeFrom')?.value
      );
      const timeTo = parseToTime(this.filtersForm.get('selectedTimeTo')?.value);
      const dateFrom = this.filtersForm.get('selectedDateFrom')?.value;
      const dateTo = this.filtersForm.get('selectedDateTo')?.value;

      if (!timeFrom || !timeTo || !dateFrom || !dateTo) {
        return;
      }

      dateFrom.setHours(timeFrom.hours, timeFrom.minutes);
      dateTo.setHours(timeTo.hours, timeTo.minutes);
      this.loadDataCallback.emit({
        surveyId: this.filtersForm.value.selectedSurveyId!,
        fromDate: dateFrom,
        toDate: dateTo,
        respondentId: this.getSelectedRespondentId(),
      });
    }
  }

  private getSelectedRespondentId(): string | undefined {
    const selectedName = this.filtersForm.get('selectedRespondentName')?.value;

    if (!selectedName) {
      return undefined;
    }

    return this.respondents.find((r) => r.username == selectedName)?.id;
  }

  exportData(): void {
    this.exportDataCallback.emit();
  }

    validateSelectedRespondent(control: AbstractControl): ValidationErrors | null{
      if (!control.value || this.respondents.some(r => r.username == control.value)){
        return null;
      }
      
      return { 'respondentDoesNotExist': true };
    }
}

function notNullOrUndefined(obj: any) {
  return obj !== null && obj !== undefined;
}
