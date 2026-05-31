import { crossDatesAndTimes } from './create-survey-sending-policy-dto';

describe('crossDatesAndTimes', () => {
  it('creates local slots from selected local dates and times and serializes them as UTC instants', () => {
    const model = crossDatesAndTimes('survey-id', [new Date(2024, 2, 31)], [
      {
        from: { hours: 7, minutes: 30 },
        to: { hours: 11, minutes: 45 }
      }
    ]);

    expect(model.surveyId).toBe('survey-id');
    expect(model.surveyParticipationTimeSlots.length).toBe(1);
    expect(model.surveyParticipationTimeSlots[0].start.getFullYear()).toBe(2024);
    expect(model.surveyParticipationTimeSlots[0].start.getMonth()).toBe(2);
    expect(model.surveyParticipationTimeSlots[0].start.getDate()).toBe(31);
    expect(model.surveyParticipationTimeSlots[0].start.getHours()).toBe(7);
    expect(model.surveyParticipationTimeSlots[0].start.getMinutes()).toBe(30);
    expect(model.surveyParticipationTimeSlots[0].finish.getHours()).toBe(11);
    expect(model.surveyParticipationTimeSlots[0].finish.getMinutes()).toBe(45);
    expect(model.surveyParticipationTimeSlots[0].start.toJSON()).toMatch(/Z$/);
    expect(model.surveyParticipationTimeSlots[0].finish.toJSON()).toMatch(/Z$/);
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

    expect(model.surveyParticipationTimeSlots.map(slot => ({
      day: slot.start.getDate(),
      hours: slot.start.getHours(),
      minutes: slot.start.getMinutes()
    }))).toEqual([
      { day: 10, hours: 7, minutes: 0 },
      { day: 10, hours: 12, minutes: 15 },
      { day: 11, hours: 7, minutes: 0 },
      { day: 11, hours: 12, minutes: 15 }
    ]);
  });
});

