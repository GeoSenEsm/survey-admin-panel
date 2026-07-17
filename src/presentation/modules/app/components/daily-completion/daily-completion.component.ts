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
  DailyCompletionCompletedSlot,
  DailyCompletionOverview,
  DailyCompletionRespondent,
  DailyCompletionTimeSlot,
} from '../../../../../domain/models/statistics';

type SlotStatus =
  | 'completed-full'
  | 'completed-gps'
  | 'completed-sensor'
  | 'completed-none'
  | 'missed'
  | 'pending';

interface SlotView {
  slot: DailyCompletionTimeSlot;
  status: SlotStatus;
  tooltip: string;
}

interface RespondentView {
  respondent: DailyCompletionRespondent;
  slots: SlotView[];
}

interface CardSizeSettings {
  width: number;
  height: number;
}

/**
 * Refresh the "missed vs pending" split once a minute so a slot that
 * just crossed its finish time flips from white to red without a manual
 * reload. Every minute is plenty — slot boundaries are minute-precise.
 */
const REFRESH_INTERVAL_MS = 60_000;

const CARD_SIZE_STORAGE_KEY = 'admin.dailyCompletion.cardSize.v4';
const DEFAULT_CARD_SIZE: CardSizeSettings = { width: 140, height: 110 };
const CARD_WIDTH_RANGE = { min: 110, max: 220 };
const CARD_HEIGHT_RANGE = { min: 90, max: 160 };
const DEFAULT_ACTIVE_WINDOW_DAYS = 7;
const ACTIVE_WINDOW_RANGE = { min: 1, max: 365 };

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
    onlyActive: new FormControl<boolean>(false, { nonNullable: true }),
    activeWindowDays: new FormControl<number>(DEFAULT_ACTIVE_WINDOW_DAYS, { nonNullable: true }),
  });

  readonly cardWidthRange = CARD_WIDTH_RANGE;
  readonly cardHeightRange = CARD_HEIGHT_RANGE;
  readonly activeWindowRange = ACTIVE_WINDOW_RANGE;
  cardSize: CardSizeSettings = { ...DEFAULT_CARD_SIZE };

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
    this.cardSize = readStoredCardSize();
    this.load();

    this.filters.controls.minFilled.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyRespondentFilter());
    this.filters.controls.maxFilled.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyRespondentFilter());
    this.filters.controls.onlyActive.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyRespondentFilter());
    this.filters.controls.activeWindowDays.valueChanges
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
    this.filters.patchValue({
      minFilled: null,
      maxFilled: null,
      onlyActive: false,
      activeWindowDays: DEFAULT_ACTIVE_WINDOW_DAYS,
    });
  }

  onCardWidthChange(value: number): void {
    this.cardSize = { ...this.cardSize, width: clamp(value, CARD_WIDTH_RANGE) };
    persistCardSize(this.cardSize);
  }

  onCardHeightChange(value: number): void {
    this.cardSize = { ...this.cardSize, height: clamp(value, CARD_HEIGHT_RANGE) };
    persistCardSize(this.cardSize);
  }

  resetCardSize(): void {
    this.cardSize = { ...DEFAULT_CARD_SIZE };
    persistCardSize(this.cardSize);
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
      const bySlotId = indexCompletedSlots(respondent.completedSlots);
      return {
        respondent,
        slots: slots.map((slot) => ({
          slot,
          status: computeStatus(slot, bySlotId, now),
          tooltip: buildTooltip(slot, bySlotId.get(slot.id)),
        })),
      };
    });
    this.applyRespondentFilter();
  }

  private applyRespondentFilter(): void {
    const min = this.filters.controls.minFilled.value;
    const max = this.filters.controls.maxFilled.value;
    const onlyActive = this.filters.controls.onlyActive.value;
    const windowDays = clamp(
      this.filters.controls.activeWindowDays.value ?? DEFAULT_ACTIVE_WINDOW_DAYS,
      ACTIVE_WINDOW_RANGE
    );
    // "Active in the last X days" is anchored to the day the admin picked
    // in the toolbar, not the wall clock. The backend already returns
    // `lastSubmissionAt` clipped to that day, so the lower bound alone
    // ("did the respondent submit anything in the trailing window?") is
    // the correct predicate here.
    let activeCutoffMs: number | null = null;
    if (onlyActive) {
      const endOfSelectedDay = new Date(this.filters.controls.date.value);
      endOfSelectedDay.setHours(23, 59, 59, 999);
      activeCutoffMs = endOfSelectedDay.getTime() - windowDays * 24 * 60 * 60 * 1000;
    }

    this.filteredRespondents = this.respondentViews.filter((view) => {
      const count = view.respondent.completedCount;
      if (typeof min === 'number' && count < min) return false;
      if (typeof max === 'number' && count > max) return false;
      if (activeCutoffMs !== null) {
        const last = view.respondent.lastSubmissionAt;
        if (!last) return false;
        if (Date.parse(last) < activeCutoffMs) return false;
      }
      return true;
    });
    this.cdr.markForCheck();
  }
}

function indexCompletedSlots(
  completedSlots: DailyCompletionCompletedSlot[]
): Map<string, DailyCompletionCompletedSlot> {
  const map = new Map<string, DailyCompletionCompletedSlot>();
  for (const slot of completedSlots) {
    map.set(slot.slotId, slot);
  }
  return map;
}

function computeStatus(
  slot: DailyCompletionTimeSlot,
  completedById: Map<string, DailyCompletionCompletedSlot>,
  nowMs: number
): SlotStatus {
  const completed = completedById.get(slot.id);
  if (completed) {
    if (completed.hasLocationData && completed.hasSensorData) return 'completed-full';
    if (completed.hasLocationData) return 'completed-gps';
    if (completed.hasSensorData) return 'completed-sensor';
    return 'completed-none';
  }
  return Date.parse(slot.finish) < nowMs ? 'missed' : 'pending';
}

function buildTooltip(
  slot: DailyCompletionTimeSlot,
  completed: DailyCompletionCompletedSlot | undefined
): string {
  const start = formatTime(slot.start);
  const finish = formatTime(slot.finish);
  const base = `${slot.surveyName} · ${start} – ${finish}`;
  if (!completed) return base;
  const extras: string[] = [];
  if (completed.hasLocationData) extras.push('GPS');
  if (completed.hasSensorData) extras.push('sensor');
  return extras.length ? `${base} · ${extras.join(' + ')}` : base;
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

function clamp(value: number, range: { min: number; max: number }): number {
  if (!Number.isFinite(value)) return range.min;
  return Math.max(range.min, Math.min(range.max, Math.round(value)));
}

function readStoredCardSize(): CardSizeSettings {
  try {
    const raw = localStorage.getItem(CARD_SIZE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CARD_SIZE };
    const parsed = JSON.parse(raw) as Partial<CardSizeSettings>;
    return {
      width: clamp(parsed?.width ?? DEFAULT_CARD_SIZE.width, CARD_WIDTH_RANGE),
      height: clamp(parsed?.height ?? DEFAULT_CARD_SIZE.height, CARD_HEIGHT_RANGE),
    };
  } catch {
    return { ...DEFAULT_CARD_SIZE };
  }
}

function persistCardSize(size: CardSizeSettings): void {
  try {
    localStorage.setItem(CARD_SIZE_STORAGE_KEY, JSON.stringify(size));
  } catch {
    // Storage may be full or disabled — degrade silently, the in-memory
    // value still applies for the current session.
  }
}
