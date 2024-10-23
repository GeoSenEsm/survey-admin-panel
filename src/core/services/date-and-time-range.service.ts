import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { adjustDateRange } from '../utils/adjust-date-range';
import { parseToTime } from '../utils/parsers';

@Injectable({
  providedIn: 'root',
})
export class DateAndTimeRangeService {
  guardDates(
    formGroup: FormGroup,
    dateFromFormControlName: string,
    timeFromFormControlName: string,
    dateToFormControlName: string,
    timeToFormControlName: string
  ): Subscription {
    const selectedDateFrom = formGroup.get(dateFromFormControlName);
    const selectedTimeFrom = formGroup.get(timeFromFormControlName);
    const selectedDateTo = formGroup.get(dateToFormControlName);
    const selectedTimeTo = formGroup.get(timeToFormControlName);

    const subscriptions = [];

    if (selectedDateFrom) {
      subscriptions.push(
        selectedDateFrom.valueChanges.subscribe(() => {
          this.adjustToToFrom(formGroup, dateFromFormControlName, timeFromFormControlName, dateToFormControlName, timeToFormControlName);
        })
      );
    }

    if (selectedTimeFrom) {
      subscriptions.push(
        selectedTimeFrom.valueChanges.subscribe(() => {
          this.adjustToToFrom(formGroup, dateFromFormControlName, timeFromFormControlName, dateToFormControlName, timeToFormControlName);
        })
      );
    }

    if (selectedDateTo) {
      subscriptions.push(
        selectedDateTo.valueChanges.subscribe(() => {
          this.adjustFromToTo(formGroup, dateFromFormControlName, timeFromFormControlName, dateToFormControlName, timeToFormControlName);
        })
      );
    }

    if (selectedTimeTo) {
      subscriptions.push(
        selectedTimeTo.valueChanges.subscribe(() => {
          this.adjustFromToTo(formGroup, dateFromFormControlName, timeFromFormControlName, dateToFormControlName, timeToFormControlName);
        })
      );
    }

    const combinedSubscription: Subscription =
      forkJoin(subscriptions).subscribe();

    return combinedSubscription;
  }

  private adjustToToFrom(
    formGroup: FormGroup,
    dateFromFormControlName: string,
    timeFromFormControlName: string,
    dateToFormControlName: string,
    timeToFormControlName: string
  ): void{
    adjustDateRange(formGroup.get(dateFromFormControlName)?.value,
      parseToTime(formGroup.get(timeFromFormControlName)?.value),
      formGroup.get(dateToFormControlName)?.value,
      parseToTime(formGroup.get(timeToFormControlName)?.value),
      'from', (newDate) => {
        formGroup.get(dateToFormControlName)?.setValue(newDate);
      });
  }

  private adjustFromToTo(
    formGroup: FormGroup,
    dateFromFormControlName: string,
    timeFromFormControlName: string,
    dateToFormControlName: string,
    timeToFormControlName: string
  ): void{
    adjustDateRange(formGroup.get(dateFromFormControlName)?.value,
      parseToTime(formGroup.get(timeFromFormControlName)?.value),
      formGroup.get(dateToFormControlName)?.value,
      parseToTime(formGroup.get(timeToFormControlName)?.value),
      'to', (newDate) => {
        formGroup.get(dateFromFormControlName)?.setValue(newDate);
      });
  }
}
