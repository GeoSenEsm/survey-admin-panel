import { Time } from '@angular/common';
import { adjustDateRange } from './adjust-date-range';

describe('adjustDateRange', () => {
  let dateChangeCallback: jasmine.Spy;

  beforeEach(() => {
    dateChangeCallback = jasmine.createSpy('dateChangeCallback');
  });

  it('should do nothing if any input is undefined', () => {
    adjustDateRange(undefined, { hours: 12, minutes: 0 }, new Date(), { hours: 12, minutes: 0 }, 'from', dateChangeCallback);
    expect(dateChangeCallback).not.toHaveBeenCalled();

    adjustDateRange(new Date(), { hours: 12, minutes: 0 }, undefined, { hours: 12, minutes: 0 }, 'from', dateChangeCallback);
    expect(dateChangeCallback).not.toHaveBeenCalled();

    adjustDateRange(new Date(), { hours: 12, minutes: 0 }, new Date(), undefined, 'from', dateChangeCallback);
    expect(dateChangeCallback).not.toHaveBeenCalled();
  });

  it('should do nothing if dateFrom is less than dateTo', () => {
    const dateFrom = new Date('2024-10-10T12:00:00');
    const timeFrom: Time = { hours: 12, minutes: 0 };
    const dateTo = new Date('2024-10-10T15:00:00');
    const timeTo: Time = { hours: 15, minutes: 0 };

    adjustDateRange(dateFrom, timeFrom, dateTo, timeTo, 'from', dateChangeCallback);
    expect(dateChangeCallback).not.toHaveBeenCalled();
  });

  it('should adjust dateTo if from is greater than to', () => {
    const dateFrom = new Date('2024-10-11T12:00:00');
    const timeFrom: Time = { hours: 12, minutes: 0 };
    const dateTo = new Date('2024-10-10T10:00:00');
    const timeTo: Time = { hours: 10, minutes: 0 };

    adjustDateRange(dateFrom, timeFrom, dateTo, timeTo, 'from', dateChangeCallback);
    expect(dateChangeCallback).toHaveBeenCalledWith(new Date('2024-10-12T10:00:00'));
  });

  it('should adjust dateFrom if to is less than from', () => {
    const dateFrom = new Date('2024-10-10T12:00:00');
    const timeFrom: Time = { hours: 12, minutes: 0 };
    const dateTo = new Date('2024-10-09T10:00:00');
    const timeTo: Time = { hours: 10, minutes: 0 };

    adjustDateRange(dateFrom, timeFrom, dateTo, timeTo, 'to', dateChangeCallback);
    expect(dateChangeCallback).toHaveBeenCalledWith(new Date('2024-10-08T12:00:00'));
  });

  it('should adjust dateTo to the next day if from is equal to to', () => {
    const dateFrom = new Date('2024-10-10T12:00:00');
    const timeFrom: Time = { hours: 12, minutes: 0 };
    const dateTo = new Date('2024-10-10T12:00:00');
    const timeTo: Time = { hours: 12, minutes: 0 };

    adjustDateRange(dateFrom, timeFrom, dateTo, timeTo, 'from', dateChangeCallback);
    expect(dateChangeCallback).toHaveBeenCalledWith(new Date('2024-10-11T12:00:00'));
  });

  it('should adjust dateFrom to the previous day if from is equal to to', () => {
    const dateFrom = new Date('2024-10-10T12:00:00');
    const timeFrom: Time = { hours: 12, minutes: 0 };
    const dateTo = new Date('2024-10-10T12:00:00');
    const timeTo: Time = { hours: 12, minutes: 0 };

    adjustDateRange(dateFrom, timeFrom, dateTo, timeTo, 'to', dateChangeCallback);
    expect(dateChangeCallback).toHaveBeenCalledWith(new Date('2024-10-09T12:00:00'));
  });
});
