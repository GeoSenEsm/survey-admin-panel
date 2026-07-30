import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { STATISTICS_SERVICE } from '../../../../../core/services/registration-names';
import { StatisticsService } from '../../../../../domain/external_services/statistics.service';
import {
  IssuesOverview,
  IssuesRangeMode,
  RespondentIssue,
} from '../../../../../domain/models/statistics';

@Component({
  selector: 'app-respondent-issues',
  standalone: false,
  templateUrl: './respondent-issues.component.html',
  styleUrl: './respondent-issues.component.css',
})
export class RespondentIssuesComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly rangeModes: { value: IssuesRangeMode; label: string }[] = [
    { value: 'survey_window', label: 'issues.filters.rangeSurveyWindow' },
    { value: 'custom', label: 'issues.filters.rangeCustom' },
  ];

  readonly filters = new FormGroup({
    rangeMode: new FormControl<IssuesRangeMode>('survey_window', {
      nonNullable: true,
    }),
    from: new FormControl<Date | null>(null),
    to: new FormControl<Date | null>(null),
    minSkipped: new FormControl<number | null>(null),
    maxSurveyPercent: new FormControl<number | null>(null),
    maxGpsPercent: new FormControl<number | null>(null),
    maxSensorPercent: new FormControl<number | null>(null),
  });

  readonly displayedColumns = [
    'username',
    'window',
    'surveys',
    'surveyPercent',
    'gpsPercent',
    'sensorPercent',
    'skipped',
  ];

  dataSource = new MatTableDataSource<RespondentIssue>([]);
  overview: IssuesOverview | null = null;
  isLoading = false;
  loadError = false;

  private allRows: RespondentIssue[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(STATISTICS_SERVICE)
    private readonly statisticsService: StatisticsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    this.filters.patchValue({ from: weekAgo, to: now });

    this.filters.controls.rangeMode.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode) => {
        if (mode === 'custom') {
          this.filters.controls.from.setValidators([Validators.required]);
          this.filters.controls.to.setValidators([Validators.required]);
        } else {
          this.filters.controls.from.clearValidators();
          this.filters.controls.to.clearValidators();
        }
        this.filters.controls.from.updateValueAndValidity({ emitEvent: false });
        this.filters.controls.to.updateValueAndValidity({ emitEvent: false });
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isCustomRange(): boolean {
    return this.filters.controls.rangeMode.value === 'custom';
  }

  reload(): void {
    this.load();
  }

  applyClientFilters(): void {
    this.dataSource.data = this.allRows.filter((row) => this.matchesFilters(row));
    this.cdr.markForCheck();
  }

  clearClientFilters(): void {
    this.filters.patchValue({
      minSkipped: null,
      maxSurveyPercent: null,
      maxGpsPercent: null,
      maxSensorPercent: null,
    });
    this.applyClientFilters();
  }

  formatPercent(value: number | null): string {
    if (value == null) return '—';
    return `${value.toFixed(1)}%`;
  }

  private load(): void {
    if (this.isLoading) return;
    const mode = this.filters.controls.rangeMode.value;
    if (mode === 'custom') {
      this.filters.controls.from.markAsTouched();
      this.filters.controls.to.markAsTouched();
      if (!this.filters.controls.from.value || !this.filters.controls.to.value) {
        return;
      }
      const from = toIsoDate(this.filters.controls.from.value);
      const to = toIsoDate(this.filters.controls.to.value);
      if (to < from) {
        this.loadError = true;
        return;
      }
    }

    this.isLoading = true;
    this.loadError = false;

    const from =
      mode === 'custom' && this.filters.controls.from.value
        ? toIsoDate(this.filters.controls.from.value)
        : undefined;
    const to =
      mode === 'custom' && this.filters.controls.to.value
        ? toIsoDate(this.filters.controls.to.value)
        : undefined;

    this.statisticsService
      .getIssuesOverview(mode, from, to)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        catchError(() => {
          this.loadError = true;
          return of<IssuesOverview | null>(null);
        })
      )
      .subscribe((overview) => {
        this.overview = overview;
        this.allRows = overview?.respondents ?? [];
        this.dataSource = new MatTableDataSource(this.allRows);
        setTimeout(() => {
          if (this.sort) this.dataSource.sort = this.sort;
          if (this.paginator) this.dataSource.paginator = this.paginator;
        });
        this.applyClientFilters();
      });
  }

  private matchesFilters(row: RespondentIssue): boolean {
    const minSkipped = this.filters.controls.minSkipped.value;
    if (typeof minSkipped === 'number' && row.skippedSurveys < minSkipped) {
      return false;
    }
    if (!percentAtMost(row.surveyCompletionPercent, this.filters.controls.maxSurveyPercent.value)) {
      return false;
    }
    if (!percentAtMost(row.gpsCompletionPercent, this.filters.controls.maxGpsPercent.value)) {
      return false;
    }
    if (!percentAtMost(row.sensorCompletionPercent, this.filters.controls.maxSensorPercent.value)) {
      return false;
    }
    return true;
  }
}

function percentAtMost(
  actual: number | null,
  max: number | null
): boolean {
  if (typeof max !== 'number') return true;
  if (actual == null) return false;
  return actual <= max;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
