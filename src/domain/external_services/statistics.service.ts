import { Observable } from 'rxjs';
import {
  DailyCompletionOverview,
  DailyStatsDetail,
  DailyStatsRow,
  GlobalStatsDetail,
  IssuesOverview,
  IssuesRangeMode,
  ParticipantStats,
  ParticipantStatsDetail,
} from '../models/statistics';

export interface StatisticsService {
  listParticipants(): Observable<ParticipantStats[]>;
  getParticipantDetail(respondentId: string): Observable<ParticipantStatsDetail>;
  getGlobalDetail(): Observable<GlobalStatsDetail>;
  /**
   * Full-day completion overview for the given ISO date (YYYY-MM-DD).
   * The backend interprets it as a UTC calendar day.
   */
  getDailyCompletion(isoDate: string): Observable<DailyCompletionOverview>;
  /**
   * Aggregates + hourly time series for the given ISO date (YYYY-MM-DD).
   */
  getDailyDetail(isoDate: string): Observable<DailyStatsDetail>;
  /** One KPI row per day across the global study window (CSV export). */
  listDailyStatsRows(): Observable<DailyStatsRow[]>;
  getIssuesOverview(
    rangeMode: IssuesRangeMode,
    from?: string,
    to?: string
  ): Observable<IssuesOverview>;
}
