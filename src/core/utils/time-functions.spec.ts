import { TimeRange } from "../models/time-range";
import { overlapping } from "./time-functions";

describe('overlapping', () => {

    it('should return false when there are no overlapping time ranges', () => {
        const timeRanges: TimeRange[] = [
            { from: { hours: 9, minutes: 0 }, to: { hours: 10, minutes: 0 } },
            { from: { hours: 10, minutes: 30 }, to: { hours: 11, minutes: 30 } },
            { from: { hours: 11, minutes: 30 }, to: { hours: 13, minutes: 0 } }
        ];

        expect(overlapping(timeRanges)).toBe(false);
    });

    it('should return true when there are overlapping time ranges', () => {
        const timeRanges: TimeRange[] = [
            { from: { hours: 9, minutes: 0 }, to: { hours: 10, minutes: 0 } },
            { from: { hours: 9, minutes: 30 }, to: { hours: 11, minutes: 0 } }, 
            { from: { hours: 12, minutes: 0 }, to: { hours: 13, minutes: 0 } }
        ];

        expect(overlapping(timeRanges)).toBe(true);
    });

    it('should return false when ranges touch but do not overlap', () => {
        const timeRanges: TimeRange[] = [
            { from: { hours: 9, minutes: 0 }, to: { hours: 10, minutes: 0 } },
            { from: { hours: 10, minutes: 0 }, to: { hours: 11, minutes: 0 } },
            { from: { hours: 12, minutes: 0 }, to: { hours: 13, minutes: 0 } }
        ];

        expect(overlapping(timeRanges)).toBe(false);
    });

    it('should return true when all ranges overlap with each other', () => {
        const timeRanges: TimeRange[] = [
            { from: { hours: 10, minutes: 15 }, to: { hours: 12, minutes: 0 } },
            { from: { hours: 9, minutes: 0 }, to: { hours: 10, minutes: 30 } },
            { from: { hours: 10, minutes: 0 }, to: { hours: 11, minutes: 0 } }
        ];

        expect(overlapping(timeRanges)).toBe(true);
    });

    it('should return false when there is only one time range', () => {
        const timeRanges: TimeRange[] = [
            { from: { hours: 9, minutes: 0 }, to: { hours: 10, minutes: 0 } }
        ];

        expect(overlapping(timeRanges)).toBe(false);
    });

    it('should return false when the input array is empty', () => {
        const timeRanges: TimeRange[] = [];

        expect(overlapping(timeRanges)).toBe(false);
    });

    it('should return false when there is a time range where from equals to (no actual duration)', () => {
        const timeRanges: TimeRange[] = [
            { from: { hours: 9, minutes: 0 }, to: { hours: 9, minutes: 0 } },
            { from: { hours: 10, minutes: 0 }, to: { hours: 11, minutes: 0 } }
        ];

        expect(overlapping(timeRanges)).toBe(false);
    });

    it('should return true when there are complex overlapping scenarios', () => {
        const timeRanges: TimeRange[] = [
            { from: { hours: 8, minutes: 0 }, to: { hours: 9, minutes: 30 } },
            { from: { hours: 9, minutes: 15 }, to: { hours: 10, minutes: 45 } },
            { from: { hours: 10, minutes: 0 }, to: { hours: 10, minutes: 30 } },
            { from: { hours: 11, minutes: 0 }, to: { hours: 12, minutes: 0 } }
        ];

        expect(overlapping(timeRanges)).toBe(true);
    });
});
