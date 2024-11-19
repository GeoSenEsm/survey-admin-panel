import { Time } from "@angular/common";

export type DateRangeAdjusTo = 'from' | 'to';

export function adjustDateRange(dateFrom: Date | undefined, timeFrom: Time | undefined,
      dateTo: Date | undefined, timeTo: Time | undefined,
      adjustTo: DateRangeAdjusTo, dateChangeCallback: (newDate: Date) => void): void{
      

      if (!dateFrom || !timeFrom || !dateTo || !timeTo){
        return;
      }

      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      from.setHours(timeFrom.hours, timeFrom.minutes);
      to.setHours(timeTo.hours, timeTo.minutes);

      if (from < to){
        return;
      }

      let daysToChange = 0;

      if (timeFrom.hours >= timeTo.hours || (timeFrom.hours === timeTo.hours && timeFrom.minutes >= timeTo.minutes)){
        daysToChange = 1;
      }

      if (adjustTo === 'from'){
        to.setDate(from.getDate() + daysToChange);
        to.setHours(timeTo.hours, timeTo.minutes);
        dateChangeCallback(to);
      } else {
        from.setDate(to.getDate() - daysToChange);
        from.setHours(timeFrom.hours, timeFrom.minutes);
        dateChangeCallback(from);
      }
    }