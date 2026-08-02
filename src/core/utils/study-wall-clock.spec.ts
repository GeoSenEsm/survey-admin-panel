import { toStudyWallClockParam } from './study-wall-clock';

describe('toStudyWallClockParam', () => {
    it('formats the Date local clock face without applying UTC conversion', () => {
        const value = new Date(2026, 7, 3, 13, 5, 9);

        expect(toStudyWallClockParam(value)).toBe('2026-08-03T13:05:09Z');
    });
});
