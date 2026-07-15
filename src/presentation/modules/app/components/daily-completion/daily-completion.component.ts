import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, catchError, finalize, of, takeUntil, timer } from 'rxjs';
import { STATISTICS_SERVICE } from '../../../../../core/services/registration-names';
import { StatisticsService } from '../../../../../domain/external_services/statistics.service';
import {
  DailyCompletionOverview,
  DailyCompletionRespondent,
  DailyCompletionTimeSlot,
} from '../../../../../domain/models/statistics';

type SlotStatus = 'completed' | 'missed' | 'pending';

interface SlotView {
  slot: DailyCompletionTimeSlot;
  status: SlotStatus;
  tooltip: string;
}

interface RespondentView {
  respondent: DailyCompletionRespondent;
  slots: SlotView[];
}

/**
 * Refresh the "missed vs pending" split once a minute so a slot that
 * just crossed its finish time flips from white to red without a manual
 * reload. Every minute is plenty — slot boundaries are minute-precise.
 */
const REFRESH_INTERVAL_MS = 60_000;

@Component({
  selector: 'app-daily-completion',
  standalone: false,
  templateUrl: './daily-completion.component.html',
  styleUrl: './daily-completion.component.css',
})
export class DailyCompletionComponent implements OnInit, OnDestroy {
  readonly filters = new FormGroup({
    date: new FormControl<Date>(new Date(), { nonNullable: true }),
    minFilled: new FormControl<number | null>(null),
    maxFilled: new FormControl<number | null>(null),
  });

  overview: DailyCompletionOverview | null = null;
  respondentViews: RespondentView[] = [];
  filteredRespondents: RespondentView[] = [];

  isLoading = false;
  loadError = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(STATISTICS_SERVICE)
    private readonly statisticsService: StatisticsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();

    this.filters.controls.minFilled.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyRespondentFilter());
    this.filters.controls.maxFilled.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyRespondentFilter());

    timer(REFRESH_INTERVAL_MS, REFRESH_INTERVAL_MS)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.rebuildViews());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDateChange(): void {
    this.load();
  }

  goToToday(): void {
    this.filters.controls.date.setValue(new Date());
    this.load();
  }

  reload(): void {
    this.load();
  }

  clearFilters(): void {
    this.filters.patchValue({ minFilled: null, maxFilled: null });
  }

  slotTrackBy(_index: number, view: SlotView): string {
    return view.slot.id;
  }

  respondentTrackBy(_index: number, view: RespondentView): string {
    return view.respondent.respondentId;
  }

  totalSlots(): number {
    return this.overview?.timeSlots.length ?? 0;
  }

  private load(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.loadError = false;

    const isoDate = toIsoDate(this.filters.controls.date.value);
    this.statisticsService
      .getDailyCompletion(isoDate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
        catchError(() => {
          this.loadError = true;
          return of<DailyCompletionOverview | null>(null);
        })
      )
      .subscribe((overview) => {
        this.overview = overview;
        this.rebuildViews();
        this.cdr.markForCheck();
      });
  }

  private rebuildViews(): void {
    if (!this.overview) {
      this.respondentViews = [];
      this.filteredRespondents = [];
      return;
    }
    const now = Date.now();
    const slots = this.overview.timeSlots;
    this.respondentViews = this.overview.respondents.map((respondent) => {
      const completed = new Set(respondent.completedTimeSlotIds);
      return {
        respondent,
        slots: slots.map((slot) => ({
          slot,
          status: computeStatus(slot, completed, now),
          tooltip: buildTooltip(slot),
        })),
      };
    });
    this.applyRespondentFilter();
  }

  private applyRespondentFilter(): void {
    const min = this.filters.controls.minFilled.value;
    const max = this.filters.controls.maxFilled.value;
    this.filteredRespondents = this.respondentViews.filter((view) => {
      const count = view.respondent.completedCount;
      if (typeof min === 'number' && count < min) return false;
      if (typeof max === 'number' && count > max) return false;
      return true;
    });
    this.cdr.markForCheck();
  }
}

function computeStatus(
  slot: DailyCompletionTimeSlot,
  completedIds: Set<string>,
  nowMs: number
): SlotStatus {
  if (completedIds.has(slot.id)) return 'completed';
  return Date.parse(slot.finish) < nowMs ? 'missed' : 'pending';
}

function buildTooltip(slot: DailyCompletionTimeSlot): string {
  const start = formatTime(slot.start);
  const finish = formatTime(slot.finish);
  return `${slot.surveyName} · ${start} – ${finish}`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
