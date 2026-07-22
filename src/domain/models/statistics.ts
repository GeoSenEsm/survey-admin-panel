export interface ParticipantStats {
  respondentId: string;
  username: string;
  firstParticipationDate: string;
  lastParticipationDate: string;
  surveysFilled: number;
  surveysAvailable: number;
  locationDataCount: number;
  sensorDataCount: number;
  outsideResearchAreaCount: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface ParticipantStatsDetail {
  stats: ParticipantStats;
  participationsPerDay: TimeSeriesPoint[];
  locationDataPerDay: TimeSeriesPoint[];
  sensorDataPerDay: TimeSeriesPoint[];
  participationsOutsideAreaPerDay: TimeSeriesPoint[];
}

export interface GlobalStats {
  firstParticipationDate: string | null;
  lastParticipationDate: string | null;
  totalParticipants: number;
  surveysFilled: number;
  surveysAvailable: number;
  locationDataCount: number;
  sensorDataCount: number;
  outsideResearchAreaCount: number;
}

export interface GlobalStatsDetail {
  stats: GlobalStats;
  participationsPerDay: TimeSeriesPoint[];
  locationDataPerDay: TimeSeriesPoint[];
  sensorDataPerDay: TimeSeriesPoint[];
  participationsOutsideAreaPerDay: TimeSeriesPoint[];
}

export interface DailyCompletionTimeSlot {
  id: string;
  surveyId: string;
  surveyName: string;
  start: string;
  finish: string;
}

export interface DailyCompletionCompletedSlot {
  slotId: string;
  hasLocationData: boolean;
  hasSensorData: boolean;
}

export interface DailyCompletionRespondent {
  respondentId: string;
  username: string;
  completedSlots: DailyCompletionCompletedSlot[];
  completedCount: number;
  surveyStartDate: string | null;
  surveyEndDate: string | null;
}

export interface DailyCompletionOverview {
  date: string;
  timeSlots: DailyCompletionTimeSlot[];
  respondents: DailyCompletionRespondent[];
}

export interface HourlySeriesPoint {
  hour: number;
  count: number;
}

export interface DailyStatsDetail {
  date: string;
  totalParticipants: number;
  surveysFilled: number;
  surveysAvailable: number;
  surveysFilledActive: number;
  surveysAvailableActive: number;
  activeRespondentCount: number;
  locationDataCount: number;
  sensorDataCount: number;
  participationsOutsideAreaCount: number;
  participationsPerHour: HourlySeriesPoint[];
  locationDataPerHour: HourlySeriesPoint[];
  sensorDataPerHour: HourlySeriesPoint[];
  participationsOutsideAreaPerHour: HourlySeriesPoint[];
}

/** KPI boxes only — one row per day for CSV export across the study window. */
export interface DailyStatsRow {
  date: string;
  totalParticipants: number;
  surveysFilled: number;
  surveysAvailable: number;
  surveysFilledActive: number;
  surveysAvailableActive: number;
  activeRespondentCount: number;
  locationDataCount: number;
  sensorDataCount: number;
  participationsOutsideAreaCount: number;
}

export type IssuesRangeMode = 'survey_window' | 'custom';

export interface RespondentIssue {
  respondentId: string;
  username: string;
  windowStart: string;
  windowEnd: string;
  surveysFilled: number;
  surveysAvailable: number;
  gpsFilled: number;
  sensorFilled: number;
  skippedSurveys: number;
  surveyCompletionPercent: number | null;
  gpsCompletionPercent: number | null;
  sensorCompletionPercent: number | null;
}

export interface IssuesOverview {
  respondents: RespondentIssue[];
  respondentsConsidered: number;
}
