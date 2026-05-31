import { Time } from "@angular/common";

export const combineToUTCDate: (date: Date, time: Time) => Date = (date: Date, time: Time) => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), time.hours, time.minutes));
};
