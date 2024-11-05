import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { parseToTime } from '../../../../../core/utils/parsers';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAndTimeRangeService } from '../../../../../core/services/data-and-time-range.service';
import { catchError, Subscription, throwError } from 'rxjs';
import { LocationFilters } from '../../../../../domain/models/location-filters';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { RespondentData } from '../../../../../domain/models/respondent-data';

@Component({
  selector: 'app-map-filters',
  templateUrl: './map-filters.component.html',
  styleUrl: './map-filters.component.scss'
})
export class MapFiltersComponent {
  @Output()
  loadDataCallback = new EventEmitter<LocationFilters>();
  @Output()
  exportDataCallback = new EventEmitter();
  @Input()
  canExport: boolean = false;
  filtersForm: FormGroup;
  subscriptionsToDisposeOnDestroy: (Subscription | undefined)[] = [];
  @Input()
  surveys: SurveySummaryShortDto[] = [];
  @Input()
  respondents: RespondentData[] = [];

  constructor(
  formBuilder: FormBuilder,
  private readonly dateAndTimeRangeService: DateAndTimeRangeService){
    this.filtersForm = formBuilder.group({
      selectedSurveyId: new FormControl<string | undefined>(undefined), 
      selectedRespondentId: new FormControl<string | undefined>(undefined),
      onlyOutside: new FormControl<boolean>(false),
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
    this.subscriptionsToDisposeOnDestroy = [
      this.dateAndTimeRangeService.guardDates(this.filtersForm, 'selectedDateFrom', 'selectedTimeFrom', 'selectedDateTo', 'selectedTimeTo'),
    ];
  }

  canLoad(): boolean{
    return this.filtersForm.value.selectedDateFrom
      && this.filtersForm.value.selectedTimeFrom && this.filtersForm.value.selectedDateTo
      && this.filtersForm.value.selectedTimeTo;
  }

  loadData(): void{
    if (this.canLoad()){
      const timeFrom =  parseToTime(this.filtersForm.get('selectedTimeFrom')?.value);
      const timeTo =  parseToTime(this.filtersForm.get('selectedTimeTo')?.value);
      const dateFrom =  this.filtersForm.get('selectedDateFrom')?.value;
      const dateTo =  this.filtersForm.get('selectedDateTo')?.value;

      if (!timeFrom || !timeTo || !dateFrom || !dateTo){
        return;
      }

      dateFrom.setHours(timeFrom.hours, timeFrom.minutes);
      dateTo.setHours(timeTo.hours, timeTo.minutes);
      const filters = {
        from: dateFrom,
        to: dateTo,
        onlyAutsideResearchArea: this.filtersForm.get('onlyOutside')?.value,
        respondentId: this.filtersForm.get('selectedRespondentId')?.value,
        surveyId: this.filtersForm.get('selectedSurveyId')?.value,
      }
      this.loadDataCallback.emit(filters);
    }
  }

  exportData(): void{
    this.exportDataCallback.emit();
  }
}


