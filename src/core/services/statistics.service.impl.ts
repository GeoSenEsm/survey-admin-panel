import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatisticsService } from '../../domain/external_services/statistics.service';
import {
  DailyCompletionOverview,
  DailyStatsDetail,
  GlobalStatsDetail,
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
}
