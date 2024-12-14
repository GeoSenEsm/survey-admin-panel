import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { parseToTime } from '../../../../../core/utils/parsers';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { DateAndTimeRangeService } from '../../../../../core/services/data-and-time-range.service';
import { catchError, Subscription, throwError } from 'rxjs';
import { LocationFilters } from '../../../../../domain/models/location-filters';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { TranslateService } from '@ngx-translate/core';

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
  private readonly dateAndTimeRangeService: DateAndTimeRangeService,
  private readonly translate: TranslateService,){
    this.filtersForm = formBuilder.group({
      selectedSurveyId: new FormControl<string | undefined>(undefined), 
      selectedRespondentName: [undefined, this.validateSelectedRespondent.bind(this)],
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

  validateSelectedRespondent(control: AbstractControl): ValidationErrors | null{
    if (!control.value || this.respondents.some(r => r.username == control.value)){
      return null;
    }

    return { 'respondentDoesNotExist': true };
  }

  canLoad(): boolean{
    return this.filtersForm.value.selectedDateFrom
      && this.filtersForm.value.selectedTimeFrom && this.filtersForm.value.selectedDateTo
      && this.filtersForm.value.selectedTimeTo
      && this.filtersForm.valid;
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
        respondentId: this.getSelectedRespondentId(),
        surveyId: this.filtersForm.get('selectedSurveyId')?.value,
      }
      this.loadDataCallback.emit(filters);
    }
  }

  private getSelectedRespondentId(): string | undefined {
    const selectedName = this.filtersForm.get('selectedRespondentName')?.value;

    if (!selectedName){
      return undefined;
    }

    return this.respondents.find(r => r.username == selectedName)?.id;
  }

  exportData(): void{
    this.exportDataCallback.emit();
  }
}


