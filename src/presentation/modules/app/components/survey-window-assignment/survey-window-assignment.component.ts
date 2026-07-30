import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import {
  AssignSurveyWindowRequest,
  SurveyWindowActivityPoint,
} from '../../../../../domain/models/survey-window';

@Component({
  selector: 'app-survey-window-assignment',
  standalone: false,
  templateUrl: './survey-window-assignment.component.html',
  styleUrl: './survey-window-assignment.component.css',
})
export class SurveyWindowAssignmentComponent implements OnInit, OnDestroy {
  readonly batchForm = new FormGroup({
    surveyStartDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    surveyEndDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
  });

  respondents: RespondentData[] = [];
  filteredRespondents: RespondentData[] = [];
  pagedRespondents: RespondentData[] = [];
  selectedIds = new Set<string>();
  usernameFilter = '';

  pageIndex = 0;
  pageSize = 25;
  readonly pageSizeOptions = [25, 50, 100];

  activityChart: EChartsOption | null = null;
  isLoading = false;
  isSaving = false;
  loadError = false;
  saveMessage: string | null = null;
  saveError = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject('respondentDataService')
    private readonly respondentService: RespondentDataService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.isLoading = true;
    this.loadError = false;
    this.saveMessage = null;

    this.respondentService
      .getRespondents(undefined)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loadError = true;
          return of<RespondentData[]>([]);
        })
      )
      .subscribe((list) => {
        this.respondents = [...list].sort((a, b) =>
          String(a.username).localeCompare(String(b.username))
        );
        this.applyUsernameFilter();
        this.isLoading = false;
        this.cdr.markForCheck();
      });

    this.respondentService
      .getSurveyWindowActivity()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of<SurveyWindowActivityPoint[]>([]))
      )
      .subscribe((series) => {
        this.activityChart = buildActivityChart(series);
        this.cdr.markForCheck();
      });
  }

  applyUsernameFilter(): void {
    const needle = this.usernameFilter.trim().toLowerCase();
    this.filteredRespondents = needle
      ? this.respondents.filter((r) =>
          String(r.username).toLowerCase().includes(needle)
        )
      : this.respondents.slice();
    this.pageIndex = 0;
    this.applyPagination();
  }

  onPage(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPagination();
  }

  private applyPagination(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedRespondents = this.filteredRespondents.slice(
      start,
      start + this.pageSize
    );
    this.cdr.markForCheck();
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggle(id: string, checked: boolean): void {
    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
  }

  selectAllFiltered(): void {
    for (const r of this.filteredRespondents) {
      this.selectedIds.add(r.id);
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  assign(): void {
    if (this.batchForm.invalid || this.selectedIds.size === 0 || this.isSaving) {
      this.batchForm.markAllAsTouched();
      return;
    }
    const start = this.batchForm.controls.surveyStartDate.value!;
    const end = this.batchForm.controls.surveyEndDate.value!;
    if (toIsoDate(end) < toIsoDate(start)) {
      this.saveError = true;
      this.saveMessage = 'surveyWindow.errors.endBeforeStart';
      return;
    }

    const body: AssignSurveyWindowRequest = {
      respondentIds: [...this.selectedIds],
      surveyStartDate: toIsoDate(start),
      surveyEndDate: toIsoDate(end),
    };
    this.persist(body);
  }

  clearDates(): void {
    if (this.selectedIds.size === 0 || this.isSaving) return;
    const body: AssignSurveyWindowRequest = {
      respondentIds: [...this.selectedIds],
      surveyStartDate: null,
      surveyEndDate: null,
    };
    this.persist(body);
  }

  private persist(body: AssignSurveyWindowRequest): void {
    this.isSaving = true;
    this.saveError = false;
    this.saveMessage = null;
    this.respondentService
      .assignSurveyWindow(body)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }),
        catchError(() => {
          this.saveError = true;
          this.saveMessage = 'surveyWindow.errors.saveFailed';
          return of(null);
        })
      )
      .subscribe((result) => {
        if (!result) return;
        this.saveMessage = 'surveyWindow.messages.saved';
        this.clearSelection();
        this.reload();
      });
  }

  trackById(_index: number, row: RespondentData): string {
    return row.id;
  }
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildActivityChart(series: SurveyWindowActivityPoint[]): EChartsOption | null {
  if (!series.length) return null;
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 24, bottom: 40 },
    xAxis: {
      type: 'category',
      data: series.map((p) => p.date),
      axisLabel: { hideOverlap: true },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: series.map((p) => p.activeCount),
        areaStyle: { opacity: 0.12 },
        lineStyle: { width: 2, color: '#3f51b5' },
        itemStyle: { color: '#3f51b5' },
      },
    ],
  };
}
