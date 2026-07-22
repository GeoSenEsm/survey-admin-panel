import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatisticsService } from '../../domain/external_services/statistics.service';
import {
  DailyCompletionOverview,
  DailyStatsDetail,
  DailyStatsRow,
  GlobalStatsDetail,
  IssuesOverview,
  IssuesRangeMode,
  ParticipantStats,
  ParticipantStatsDetail,
} from '../../domain/models/statistics';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

@Injectable()
export class StatisticsServiceImpl
  extends ApiService
  implements StatisticsService {
  constructor(client: HttpClient, configService: ConfigService) {
    super(client, configService);
  }

  listParticipants(): Observable<ParticipantStats[]> {
    return this.get<ParticipantStats[]>('/api/statistics/participants');
  }

  getParticipantDetail(respondentId: string): Observable<ParticipantStatsDetail> {
    return this.get<ParticipantStatsDetail>(
      `/api/statistics/participants/${respondentId}`
    );
  }

  getGlobalDetail(): Observable<GlobalStatsDetail> {
    return this.get<GlobalStatsDetail>('/api/statistics/global');
  }

  getDailyCompletion(isoDate: string): Observable<DailyCompletionOverview> {
    return this.get<DailyCompletionOverview>('/api/statistics/daily-completion', {
      date: isoDate,
    });
  }

  getDailyDetail(isoDate: string): Observable<DailyStatsDetail> {
    return this.get<DailyStatsDetail>('/api/statistics/daily', { date: isoDate });
  }

  listDailyStatsRows(): Observable<DailyStatsRow[]> {
    return this.get<DailyStatsRow[]>('/api/statistics/daily/rows');
  }

  getIssuesOverview(
    rangeMode: IssuesRangeMode,
    from?: string,
    to?: string
  ): Observable<IssuesOverview> {
    const params: { [key: string]: string } = { rangeMode };
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.get<IssuesOverview>('/api/statistics/issues', params);
  }
}
