import { Time } from "@angular/common";
import { parseToTime } from "./parsers";

describe('parseToTime', () => {
  it('should parse 12-hour format time correctly', () => {
    const result: Time | undefined = parseToTime('02:30 PM');
    expect(result).toEqual({ hours: 14, minutes: 30 });

    const result2: Time | undefined = parseToTime('12:00 AM');
    expect(result2).toEqual({ hours: 0, minutes: 0 });

    const result3: Time | undefined = parseToTime('12:30 PM');
    expect(result3).toEqual({ hours: 12, minutes: 30 });
  });

  it('should parse 24-hour format time correctly', () => {
    const result: Time | undefined = parseToTime('14:30');
    expect(result).toEqual({ hours: 14, minutes: 30 });

    const result2: Time | undefined = parseToTime('00:00');
    expect(result2).toEqual({ hours: 0, minutes: 0 });

    const result3: Time | undefined = parseToTime('23:59');
    expect(result3).toEqual({ hours: 23, minutes: 59 });
  });

  it('should return undefined for invalid time strings', () => {
    const result: Time | undefined = parseToTime('25:00');
    expect(result).toBeUndefined();

    const result2: Time | undefined = parseToTime('12:60 PM');
    expect(result2).toBeUndefined();

    const result3: Time | undefined = parseToTime('Invalid Time');
    expect(result3).toBeUndefined();
  });

  it('should return undefined for unsupported format types', () => {
    const result: Time | undefined = parseToTime('14:30');
    expect(result).toBeUndefined();
  });
});
