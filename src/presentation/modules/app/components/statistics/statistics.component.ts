import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EChartsOption } from 'echarts';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { STATISTICS_SERVICE } from '../../../../../core/services/registration-names';
import { StatisticsService } from '../../../../../domain/external_services/statistics.service';
import {
  DailyStatsDetail,
  DailyStatsRow,
  GlobalStatsDetail,
  HourlySeriesPoint,
  ParticipantStats,
  ParticipantStatsDetail,
  TimeSeriesPoint,
} from '../../../../../domain/models/statistics';


type ViewMode = 'global' | 'daily' | 'participant';

const DAILY_CSV_COLUMNS: (keyof DailyStatsRow)[] = [
  'date',
  'totalParticipants',
  'surveysFilled',
  'surveysAvailable',
  'surveysFilledActive',
  'surveysAvailableActive',
  'activeRespondentCount',
  'locationDataCount',
  'sensorDataCount',
  'participationsOutsideAreaCount',
];

const PARTICIPANT_CSV_COLUMNS: (keyof ParticipantStats)[] = [
  'username',
  'respondentId',
  'firstParticipationDate',
  'lastParticipationDate',
  'surveysFilled',
  'surveysAvailable',
  'locationDataCount',
  'sensorDataCount',
  'outsideResearchAreaCount',
];

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit, OnDestroy {
  viewMode: ViewMode = 'global';

  readonly dailyDateControl = new FormControl<Date>(new Date(), { nonNullable: true });
  // Autocomplete writes the selected option value (a ParticipantStats object)
  // into this control on selection; during typing it holds the raw string.
  readonly participantSearchControl = new FormControl<string | ParticipantStats>('', {
    nonNullable: true,
  });

  participants: ParticipantStats[] = [];
  filteredParticipants: ParticipantStats[] = [];
  globalDetail: GlobalStatsDetail | null = null;
  participantDetail: ParticipantStatsDetail | null = null;
  dailyDetail: DailyStatsDetail | null = null;
  selectedParticipantId: string | null = null;

  isLoadingGlobal = false;
  isLoadingParticipant = false;
  isLoadingDaily = false;
  isExportingDaily = false;
  loadError = false;

  participationsChart: EChartsOption | null = null;
  locationChart: EChartsOption | null = null;
  sensorChart: EChartsOption | null = null;
  outsideAreaChart: EChartsOption | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(STATISTICS_SERVICE)
    private readonly statisticsService: StatisticsService,
    private readonly exportService: CsvExportService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadParticipantsList();
    this.loadGlobal();

    this.participantSearchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.applyParticipantFilter(value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode = mode;
    if (mode === 'participant') {
      if (this.participantDetail) {
        this.rebuildParticipantCharts();
      } else if (this.selectedParticipantId) {
        this.loadParticipant(this.selectedParticipantId);
      } else {
        this.clearCharts();
      }
    } else if (mode === 'daily') {
      if (this.dailyDetail) {
        this.rebuildDailyCharts();
      } else {
        this.loadDaily();
      }
    } else {
      if (this.globalDetail) {
        this.rebuildGlobalCharts();
      } else {
        this.loadGlobal();
      }
    }
    this.cdr.markForCheck();
  }

  onParticipantChange(respondentId: string): void {
    this.selectedParticipantId = respondentId;
    this.loadParticipant(respondentId);
  }

  onParticipantSelected(participant: ParticipantStats): void {
    this.selectedParticipantId = participant.respondentId;
    // Show the current filtered list rather than reapplying the "search"
    // against the selected participant's username (which would collapse
    // the panel to a single entry the next time the user opens it).
    this.filteredParticipants = this.participants.slice();
    this.loadParticipant(participant.respondentId);
  }

  displayParticipant = (value: string | ParticipantStats | null): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.username;
  };

  participantTrackBy(_index: number, participant: ParticipantStats): string {
    return participant.respondentId;
  }

  clearParticipantSearch(): void {
    this.participantSearchControl.setValue('');
  }

  private applyParticipantFilter(query: string | ParticipantStats | null): void {
    // When the user picks an option the control briefly holds the whole
    // participant object; treat that as "no active search" so the panel
    // keeps showing the full list next time it opens.
    const needle = (typeof query === 'string' ? query : '').trim().toLowerCase();
    if (!needle) {
      this.filteredParticipants = this.participants.slice();
      return;
    }
    this.filteredParticipants = this.participants.filter((p) =>
      p.username.toLowerCase().includes(needle)
    );
  }

  onDailyDateChange(): void {
    this.loadDaily();
  }

  goToToday(): void {
    this.dailyDateControl.setValue(new Date());
    this.loadDaily();
  }

  exportDailyCsv(): void {
    if (this.isExportingDaily) return;
    this.isExportingDaily = true;
    this.cdr.markForCheck();

    this.statisticsService
      .listDailyStatsRows()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loadError = true;
          return of<DailyStatsRow[]>([]);
        })
      )
      .subscribe((rows) => {
        this.isExportingDaily = false;
        if (rows.length > 0) {
          const filename = this.translate.instant('statistics.export.dailyFilename');
          this.exportService.exportTableToCSV(
            rows,
            DAILY_CSV_COLUMNS as string[],
            filename
          );
        }
        this.cdr.markForCheck();
      });
  }

  exportParticipantsCsv(): void {
    if (this.participants.length === 0) return;
    const filename = this.translate.instant('statistics.export.participantsFilename');
    this.exportService.exportTableToCSV(
      this.participants,
      PARTICIPANT_CSV_COLUMNS as string[],
      filename
    );
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
        this.applyParticipantFilter(this.participantSearchControl.value);
        if (list.length && !this.selectedParticipantId) {
          this.selectedParticipantId = list[0].respondentId;
        }
        // Reflect any pre-selected participant in the search input so users
        // see who's currently selected when they land on the tab.
        const selected =
          this.selectedParticipantId &&
          list.find((p) => p.respondentId === this.selectedParticipantId);
        if (selected) {
          this.participantSearchControl.setValue(selected, { emitEvent: false });
        }
      });
  }

  private loadGlobal(): void {
    if (this.isLoadingGlobal) return;
    this.isLoadingGlobal = true;
    this.loadError = false;
    this.globalDetail = null;
    this.clearCharts();
    this.cdr.markForCheck();

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
    this.participantDetail = null;
    this.clearCharts();
    this.cdr.markForCheck();

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

  private loadDaily(): void {
    if (this.isLoadingDaily) return;
    this.isLoadingDaily = true;
    this.loadError = false;
    this.dailyDetail = null;
    this.clearCharts();
    this.cdr.markForCheck();

    const isoDate = toIsoDate(this.dailyDateControl.value);
    this.statisticsService
      .getDailyDetail(isoDate)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loadError = true;
          return of<DailyStatsDetail | null>(null);
        })
      )
      .subscribe((detail) => {
        this.isLoadingDaily = false;
        this.dailyDetail = detail;
        this.rebuildDailyCharts();
        this.cdr.markForCheck();
      });
  }

  private rebuildGlobalCharts(): void {
    if (!this.globalDetail) {
      this.clearCharts();
      return;
    }
    this.participationsChart = dailyLineChart(
      this.globalDetail.participationsPerDay,
      '#3f51b5'
    );
    this.locationChart = dailyLineChart(this.globalDetail.locationDataPerDay, '#009688');
    this.sensorChart = dailyLineChart(this.globalDetail.sensorDataPerDay, '#ff9800');
    this.outsideAreaChart = dailyLineChart(
      this.globalDetail.participationsOutsideAreaPerDay,
      '#d93025'
    );
  }

  private rebuildParticipantCharts(): void {
    if (!this.participantDetail) {
      this.clearCharts();
      return;
    }
    this.participationsChart = dailyLineChart(
      this.participantDetail.participationsPerDay,
      '#3f51b5'
    );
    this.locationChart = dailyLineChart(
      this.participantDetail.locationDataPerDay,
      '#009688'
    );
    this.sensorChart = dailyLineChart(
      this.participantDetail.sensorDataPerDay,
      '#ff9800'
    );
    this.outsideAreaChart = dailyLineChart(
      this.participantDetail.participationsOutsideAreaPerDay,
      '#d93025'
    );
  }

  private rebuildDailyCharts(): void {
    if (!this.dailyDetail) {
      this.clearCharts();
      return;
    }
    this.participationsChart = hourlyLineChart(
      this.dailyDetail.participationsPerHour,
      '#3f51b5'
    );
    this.locationChart = hourlyLineChart(
      this.dailyDetail.locationDataPerHour,
      '#009688'
    );
    this.sensorChart = hourlyLineChart(
      this.dailyDetail.sensorDataPerHour,
      '#ff9800'
    );
    this.outsideAreaChart = hourlyLineChart(
      this.dailyDetail.participationsOutsideAreaPerHour,
      '#d93025'
    );
  }

  private clearCharts(): void {
    this.participationsChart = null;
    this.locationChart = null;
    this.sensorChart = null;
    this.outsideAreaChart = null;
  }
}

function dailyLineChart(series: TimeSeriesPoint[], color: string): EChartsOption {
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

function hourlyLineChart(series: HourlySeriesPoint[], color: string): EChartsOption {
  const hours = series.map((p) => `${String(p.hour).padStart(2, '0')}:00`);
  const values = series.map((p) => p.count);
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: hours, boundaryGap: false },
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

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
