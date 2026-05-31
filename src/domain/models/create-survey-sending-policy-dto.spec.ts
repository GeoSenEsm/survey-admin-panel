import { crossDatesAndTimes } from './create-survey-sending-policy-dto';

describe('crossDatesAndTimes', () => {
  it('creates UTC wall-clock slots from selected local dates and times', () => {
    const model = crossDatesAndTimes('survey-id', [new Date(2024, 2, 31)], [
      {
        from: { hours: 7, minutes: 30 },
        to: { hours: 11, minutes: 45 }
      }
    ]);

    expect(model.surveyId).toBe('survey-id');
    expect(model.surveyParticipationTimeSlots.length).toBe(1);
    expect(model.surveyParticipationTimeSlots[0].start.toISOString()).toBe('2024-03-31T07:30:00.000Z');
    expect(model.surveyParticipationTimeSlots[0].finish.toISOString()).toBe('2024-03-31T11:45:00.000Z');
  });

  it('creates every selected date and time range combination', () => {
    const model = crossDatesAndTimes('survey-id', [new Date(2024, 0, 10), new Date(2024, 0, 11)], [
      {
        from: { hours: 7, minutes: 0 },
        to: { hours: 8, minutes: 0 }
      },
      {
        from: { hours: 12, minutes: 15 },
        to: { hours: 13, minutes: 45 }
      }
    ]);

    expect(model.surveyParticipationTimeSlots.map(slot => slot.start.toISOString())).toEqual([
      '2024-01-10T07:00:00.000Z',
      '2024-01-10T12:15:00.000Z',
      '2024-01-11T07:00:00.000Z',
      '2024-01-11T12:15:00.000Z'
    ]);
  });
});

