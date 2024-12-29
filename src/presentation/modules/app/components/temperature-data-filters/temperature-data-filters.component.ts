import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DateAndTimeRangeService } from '../../../../../core/services/data-and-time-range.service';
import { parseToTime } from '../../../../../core/utils/parsers';
import { TemperatureDataFilter } from '../../../../../domain/models/temperature-data-filter';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-temperature-data-filters',
  templateUrl: './temperature-data-filters.component.html',
  styleUrl: './temperature-data-filters.component.scss',
})
export class TemperatureDataFiltersComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Output()
  loadDataCallback = new EventEmitter<TemperatureDataFilter>();
  @Output()
  exportDataCallback = new EventEmitter();
  @Input()
  canExport: boolean = false;
  @Input()
  respondents: RespondentData[] = [];
  filtersForm: FormGroup;
  subscriptionsToDisposeOnDestroy: (Subscription | undefined)[] = [];

  constructor(
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    formBuilder: FormBuilder,
    private readonly dateAndTimeRangeService: DateAndTimeRangeService,
    private readonly route: ActivatedRoute
  ) {
    this.filtersForm = formBuilder.group({
      selectedRespondentName: [
        undefined,
        this.validateSelectedRespondent.bind(this),
      ],
      selectedSurveyId: new FormControl<string | undefined>(undefined),
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
    const routeListener = this.route.queryParamMap.subscribe((params) => {
      this.filtersForm.patchValue({
        selectedRespondentName: params.get('respondent'),
      });
    });

    this.subscriptionsToDisposeOnDestroy.push(routeListener);
  }

  canLoad(): boolean {
    return this.filtersForm.valid;
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
        from: dateFrom,
        to: dateTo,
        respondentId: this.getSelectedRespondentId(),
      });
    }
  }

  exportData(): void {
    this.exportDataCallback.emit();
  }

  validateSelectedRespondent(
    control: AbstractControl
  ): ValidationErrors | null {
    if (
      !control.value ||
      this.respondents.some((r) => r.username == control.value)
    ) {
      return null;
    }

    return { respondentDoesNotExist: true };
  }

  private getSelectedRespondentId(): string | undefined {
    const selectedName = this.filtersForm.get('selectedRespondentName')?.value;

    if (!selectedName) {
      return undefined;
    }

    return this.respondents.find((r) => r.username == selectedName)?.id;
  }
}
