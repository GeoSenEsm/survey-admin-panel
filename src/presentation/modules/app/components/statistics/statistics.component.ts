import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { STATISTICS_SERVICE } from '../../../../../core/services/registration-names';
import { StatisticsService } from '../../../../../domain/external_services/statistics.service';
import {
  GlobalStatsDetail,
  ParticipantStats,
  ParticipantStatsDetail,
  TimeSeriesPoint,
} from '../../../../../domain/models/statistics';

type ViewMode = 'global' | 'participant';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit, OnDestroy {
  viewMode: ViewMode = 'global';

  participants: ParticipantStats[] = [];
  globalDetail: GlobalStatsDetail | null = null;
  participantDetail: ParticipantStatsDetail | null = null;
  selectedParticipantId: string | null = null;

  isLoadingGlobal = false;
  isLoadingParticipant = false;
  loadError = false;

  participationsChart: EChartsOption | null = null;
  locationChart: EChartsOption | null = null;
  sensorChart: EChartsOption | null = null;
  filledVsAvailableChart: EChartsOption | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(STATISTICS_SERVICE)
    private readonly statisticsService: StatisticsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadParticipantsList();
    this.loadGlobal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode = mode;
    if (mode === 'participant' && this.selectedParticipantId) {
      this.loadParticipant(this.selectedParticipantId);
    }
  }

  onParticipantChange(respondentId: string): void {
    this.selectedParticipantId = respondentId;
    this.loadParticipant(respondentId);
  }

  fillRatio(filled: number, available: number): number {
    if (available <= 0) return 0;
    return Math.min(100, Math.round((filled / available) * 100));
  }

  private loadParticipantsList(): void {
    this.statisticsService
      .listParticipants()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loadError = true;
          return of<ParticipantStats[]>([]);
        })
      )
      .subscribe((list) => {
        this.participants = list;
        if (list.length && !this.selectedParticipantId) {
          this.selectedParticipantId = list[0].respondentId;
        }
      });
  }

  private loadGlobal(): void {
    if (this.isLoadingGlobal) return;
    this.isLoadingGlobal = true;
    this.loadError = false;

    this.statisticsService
      .getGlobalDetail()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loadError = true;
          return of<GlobalStatsDetail | null>(null);
        })
      )
      .subscribe((detail) => {
        this.isLoadingGlobal = false;
        this.globalDetail = detail;
        this.rebuildGlobalCharts();
        this.cdr.markForCheck();
      });
  }

  private loadParticipant(respondentId: string): void {
    if (this.isLoadingParticipant) return;
    this.isLoadingParticipant = true;
    this.loadError = false;

    this.statisticsService
      .getParticipantDetail(respondentId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loadError = true;
          return of<ParticipantStatsDetail | null>(null);
        })
      )
      .subscribe((detail) => {
        this.isLoadingParticipant = false;
        this.participantDetail = detail;
        this.rebuildParticipantCharts();
        this.cdr.markForCheck();
      });
  }

  private rebuildGlobalCharts(): void {
    if (!this.globalDetail) {
      this.participationsChart = null;
      this.locationChart = null;
      this.sensorChart = null;
      this.filledVsAvailableChart = null;
      return;
    }
    this.participationsChart = lineChart(
      this.globalDetail.participationsPerDay,
      '#3f51b5'
    );
    this.locationChart = lineChart(this.globalDetail.locationDataPerDay, '#009688');
    this.sensorChart = lineChart(this.globalDetail.sensorDataPerDay, '#ff9800');
    this.filledVsAvailableChart = filledVsAvailableChart(
      this.globalDetail.topParticipants
    );
  }

  private rebuildParticipantCharts(): void {
    if (!this.participantDetail) {
      this.participationsChart = null;
      this.locationChart = null;
      this.sensorChart = null;
      this.filledVsAvailableChart = null;
      return;
    }
    this.participationsChart = lineChart(
      this.participantDetail.participationsPerDay,
      '#3f51b5'
    );
    this.locationChart = lineChart(
      this.participantDetail.locationDataPerDay,
      '#009688'
    );
    this.sensorChart = lineChart(
      this.participantDetail.sensorDataPerDay,
      '#ff9800'
    );
    this.filledVsAvailableChart = filledVsAvailableChart([
      this.participantDetail.stats,
    ]);
  }
}

function lineChart(series: TimeSeriesPoint[], color: string): EChartsOption {
  const dates = series.map((p) => p.date);
  const values = series.map((p) => p.count);
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        showSymbol: false,
        areaStyle: { opacity: 0.15 },
        lineStyle: { color },
        itemStyle: { color },
      },
    ],
  };
}

function filledVsAvailableChart(participants: ParticipantStats[]): EChartsOption {
  const usernames = participants.map((p) => p.username);
  const filled = participants.map((p) => p.surveysFilled);
  const available = participants.map((p) => p.surveysAvailable);
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { left: 100, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: usernames, inverse: true },
    series: [
      {
        name: 'Filled',
        type: 'bar',
        data: filled,
        itemStyle: { color: '#3f51b5' },
      },
      {
        name: 'Available',
        type: 'bar',
        data: available,
        itemStyle: { color: '#c5cae9' },
      },
    ],
  };
}
