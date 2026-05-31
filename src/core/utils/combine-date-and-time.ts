import { Time } from "@angular/common";

export const combineToLocalDate: (date: Date, time: Time) => Date = (date: Date, time: Time) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.hours, time.minutes);
};
