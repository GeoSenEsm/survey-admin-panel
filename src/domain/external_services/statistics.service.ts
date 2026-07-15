import { Observable } from 'rxjs';
import {
  DailyCompletionOverview,
  GlobalStatsDetail,
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
}
