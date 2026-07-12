import { Observable } from 'rxjs';
import {
  GlobalStatsDetail,
  ParticipantStats,
  ParticipantStatsDetail,
} from '../models/statistics';

export interface StatisticsService {
  listParticipants(): Observable<ParticipantStats[]>;
  getParticipantDetail(respondentId: string): Observable<ParticipantStatsDetail>;
  getGlobalDetail(): Observable<GlobalStatsDetail>;
}
