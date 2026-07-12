export interface ParticipantStats {
  respondentId: string;
  username: string;
  firstParticipationDate: string;
  lastParticipationDate: string;
  surveysFilled: number;
  surveysAvailable: number;
  locationDataCount: number;
  sensorDataCount: number;
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
}

export interface GlobalStats {
  firstParticipationDate: string | null;
  lastParticipationDate: string | null;
  totalParticipants: number;
  surveysFilled: number;
  surveysAvailable: number;
  locationDataCount: number;
  sensorDataCount: number;
}

export interface GlobalStatsDetail {
  stats: GlobalStats;
  participationsPerDay: TimeSeriesPoint[];
  locationDataPerDay: TimeSeriesPoint[];
  sensorDataPerDay: TimeSeriesPoint[];
  topParticipants: ParticipantStats[];
}
