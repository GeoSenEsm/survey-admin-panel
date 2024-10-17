export interface CreateSurveyParticipationTimeSlotDto {
  start: Date;
  finish: Date;
}

export const overlap = (slots: CreateSurveyParticipationTimeSlotDto[]) => {
  if (slots.length < 2) {
    return false;
  }

  const sorted = slots
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (curr.start == prev.start) {
      return true;
    }

    if (curr.start.getTime() < prev.finish.getTime()) {
      return true;
    }
  }

  return false;
};
