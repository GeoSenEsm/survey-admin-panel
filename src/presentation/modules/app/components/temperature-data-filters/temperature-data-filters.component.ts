import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DateAndTimeRangeService } from '../../../../../core/services/data-and-time-range.service';
import { parseToTime } from '../../../../../core/utils/parsers';
import { TemperatureDataFilter } from '../../../../../domain/models/temperature-data-filter';

@Component({
  selector: 'app-temperature-data-filters',
  templateUrl: './temperature-data-filters.component.html',
  styleUrl: './temperature-data-filters.component.scss'
})
export class TemperatureDataFiltersComponent {
  @Output()
  loadDataCallback = new EventEmitter<TemperatureDataFilter>();
  @Output()
  exportDataCallback = new EventEmitter();
  @Input()
  canExport: boolean = false;
  filtersForm: FormGroup;
  subscriptionsToDisposeOnDestroy: (Subscription | undefined)[] = [];

  constructor(private readonly snackbar: MatSnackBar,
  private readonly translate: TranslateService,
  formBuilder: FormBuilder,
  private readonly dateAndTimeRangeService: DateAndTimeRangeService){
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
      this.loadDataCallback.emit({
        from: dateFrom,
        to: dateTo
      });
    }
  }

  exportData(): void{
    this.exportDataCallback.emit();
  }
}
