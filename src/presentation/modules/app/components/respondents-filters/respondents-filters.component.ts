import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  RespondentFilterOption,
  RespondentFilters,
} from '../../../../../domain/models/respondent-data';
import { parseToTime } from '../../../../../core/utils/parsers';
import { TimeScale } from 'chart.js/dist';
import { adjustDateRange } from '../../../../../core/utils/adjust-date-range';

@Component({
  selector: 'app-respondents-filters',
  templateUrl: './respondents-filters.component.html',
  styleUrl: './respondents-filters.component.scss',
})
export class RespondentsFiltersComponent implements OnChanges {
  @Input()
  filtersModel: RespondentFilters | undefined;

  allFilterOptions: RespondentFilterOption[] = [
    RespondentFilterOption.SKIPPED_SURVEYS,
    RespondentFilterOption.LOCATION_NOT_SENT,
    RespondentFilterOption.SENSORS_DATA_NOT_SENT,
  ];

  filterOptionDisplayMappings: Record<RespondentFilterOption, string> = {
    [RespondentFilterOption.SKIPPED_SURVEYS]:
      'respondents.filters.hasNotSentAtLeastNumberOfSurveys',
    [RespondentFilterOption.LOCATION_NOT_SENT]:
      'respondents.filters.hasNotSentAtLeastNumberOfLocationData',
    [RespondentFilterOption.SENSORS_DATA_NOT_SENT]:
      'respondents.filters.hasNotSentAtLeastNumberOfSensorsData',
  };

  private _dateFrom?: Date;
  get dateFrom(): Date | undefined {
    return this._dateFrom;
  }
  set dateFrom(value: Date | undefined) {
    this._dateFrom = value;
    if (this._dateFrom && this.filtersModel) {
      this.filtersModel.from = new Date(
        Date.UTC(
          value!.getUTCFullYear(),
          value!.getUTCMonth(),
          value!.getUTCDate(),
          this.filtersModel.from.getUTCHours(),
          this.filtersModel.from.getUTCMinutes()
        )
      );
      adjustDateRange(
        this.dateFrom,
        parseToTime(this.timeFrom ?? ''),
        this.dateTo,
        parseToTime(this.timeTo ?? ''),
        'from',
        (date) => (this.dateTo = date)
      );
    }
  }

  private _timeFrom: string | undefined;
  get timeFrom(): string | undefined {
    return this._timeFrom;
  }
  set timeFrom(val: string | undefined) {
    this._timeFrom = val;
    if (val && this.filtersModel) {
      const time = parseToTime(val);
      this.filtersModel.to = new Date(
        Date.UTC(
          this.filtersModel.from.getUTCFullYear(),
          this.filtersModel.from.getUTCMonth(),
          this.filtersModel.from.getUTCDate(),
          time?.hours,
          time?.minutes
        )
      );
      adjustDateRange(
        this.dateFrom,
        parseToTime(this.timeFrom ?? ''),
        this.dateTo,
        parseToTime(this.timeTo ?? ''),
        'from',
        (date) => (this.dateTo = date)
      );
    }
  }

  private _dateTo?: Date;
  get dateTo(): Date | undefined {
    return this._dateTo;
  }
  set dateTo(value: Date | undefined) {
    this._dateTo = value;
    if (this._dateTo && this.filtersModel) {
      this.filtersModel.from = new Date(
        Date.UTC(
          value!.getUTCFullYear(),
          value!.getUTCMonth(),
          value!.getUTCDate(),
          this.filtersModel.to.getUTCHours(),
          this.filtersModel.to.getUTCMinutes()
        )
      );
      adjustDateRange(
        this.dateFrom,
        parseToTime(this.timeFrom ?? ''),
        this.dateTo,
        parseToTime(this.timeTo ?? ''),
        'to',
        (date) => (this.dateFrom = date)
      );
    }
  }

  private _timeTo: string | undefined;
  get timeTo(): string | undefined {
    return this._timeTo;
  }
  set timeTo(val: string | undefined) {
    this._timeTo = val;
    if (val && this.filtersModel) {
      const time = parseToTime(val);
      this.filtersModel.to = new Date(
        Date.UTC(
          this.filtersModel.to.getUTCFullYear(),
          this.filtersModel.to.getUTCMonth(),
          this.filtersModel.to.getUTCDate(),
          time?.hours,
          time?.minutes
        )
      );
      adjustDateRange(
        this.dateFrom,
        parseToTime(this.timeFrom ?? ''),
        this.dateTo,
        parseToTime(this.timeTo ?? ''),
        'to',
        (date) => (this.dateFrom = date)
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtersModel']) {
      this._dateFrom = this.filtersModel?.from;
      this._dateTo = this.filtersModel?.to;
      this._timeFrom = `${this.filtersModel?.from.getUTCHours()}:${this.filtersModel?.from.getUTCMinutes().toString().padStart(2, '0')}`;
      this._timeTo = `${this.filtersModel?.to.getUTCHours()}:${this.filtersModel?.to.getUTCMinutes().toString().padStart(2, '0')}`;
    }
  }
}
