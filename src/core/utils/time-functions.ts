import { Time } from '@angular/common';
import { StringTimeRange, TimeRange } from '../models/time-range';
import { parseToTime } from './parsers';

export const overlapping: (timeRanges: TimeRange[]) => boolean = (
  timeRanges: TimeRange[]
) => {
  if (timeRanges.length < 2) {
    return false;
  }

  const sortedRanges = timeRanges.slice().sort((a, b) => getMinutes(a.from) - getMinutes(b.from));

  for (let i = 1; i < sortedRanges.length; i++) {
    const prev = sortedRanges[i - 1];
    const curr = sortedRanges[i];

    if (curr.from == prev.from){
      return true;
    }

    if (getMinutes(curr.from) < getMinutes(prev.to)) {
      return true;
    }
  }

  return false;
};

const getMinutes: (time: Time) => number = (time: Time) => {
  return time.hours * 60 + time.minutes;
}

export const stringTimeRangesOverlapping: (timeRanges: StringTimeRange[]) => boolean = 
(timeRanges: StringTimeRange[]) => {
  return overlapping(timeRanges.map(e => {
    return {
      from: parseToTime(e.from)!,
      to: parseToTime(e.to)!
    }
  }));
}