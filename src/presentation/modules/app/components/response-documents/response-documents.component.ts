import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { RESPONSE_DOCUMENTS_SERVICE } from '../../../../../core/services/registration-names';
import { ResponseDocumentsService } from '../../../../../domain/external_services/response-documents.service';
import {
  PagedResponseDocuments,
  SurveyResponseDocument,
  SurveyResponseDocumentFilter,
} from '../../../../../domain/models/survey-response-document';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { SurveyDto } from '../../../../../domain/models/survey.dto';

@Component({
  selector: 'app-response-documents',
  templateUrl: './response-documents.component.html',
  styleUrl: './response-documents.component.css',
})
export class ResponseDocumentsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns = [
    'participationDate',
    'surveyName',
    'respondentUsername',
    'answerCount',
    'actions',
  ];
  readonly pageSizeOptions = [10, 20, 50, 100];

  filtersForm: FormGroup;
  surveys: SurveyDto[] = [];
  documents: SurveyResponseDocument[] = [];
  totalElements = 0;
  isBusy = false;
  isExporting = false;
  loadError = false;
  exportError = false;
  loadedAtLeastOnce = false;

  private currentPage = 0;
  private currentSize = this.pageSizeOptions[1];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    @Inject(RESPONSE_DOCUMENTS_SERVICE)
    private readonly responseDocumentsService: ResponseDocumentsService,
    @Inject('surveyService') private readonly surveyService: SurveyService
  ) {
    const today = startOfLocalDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.filtersForm = this.formBuilder.group({
      surveyId: [''],
      dateFrom: [today],
      dateTo: [tomorrow],
    });
  }

  ngOnInit(): void {
    this.loadSurveys();
  }

  ngAfterViewInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    this.currentPage = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.load();
  }

  clearFilters(): void {
    const today = startOfLocalDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.filtersForm.reset({ surveyId: '', dateFrom: today, dateTo: tomorrow });
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.load();
  }

  downloadDocument(document: SurveyResponseDocument): void {
    this.responseDocumentsService
      .download(document.participationId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe((payload) => {
        if (payload) {
          triggerJsonDownload(
            payload,
            `survey-response-${document.participationId}.json`
          );
        }
      });
  }

  exportZip(): void {
    if (this.isExporting) return;
    this.isExporting = true;
    this.exportError = false;

    this.responseDocumentsService
      .exportZip(this.currentFilter())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isExporting = false)),
        catchError(() => {
          this.exportError = true;
          return of<Blob | null>(null);
        })
      )
      .subscribe((blob) => {
        if (blob) triggerBlobDownload(blob, this.buildExportFilename());
      });
  }

  private buildExportFilename(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const stamp =
      now.getUTCFullYear().toString() +
      pad(now.getUTCMonth() + 1) +
      pad(now.getUTCDate()) +
      '-' +
      pad(now.getUTCHours()) +
      pad(now.getUTCMinutes()) +
      pad(now.getUTCSeconds()) +
      'Z';
    return `survey-responses-${stamp}.zip`;
  }

  private currentFilter(): SurveyResponseDocumentFilter {
    return {
      surveyId: this.filtersForm.value.surveyId || undefined,
      dateFrom: this.filtersForm.value.dateFrom || undefined,
      dateTo: this.filtersForm.value.dateTo || undefined,
      page: this.currentPage,
      size: this.currentSize,
    };
  }

  private load(): void {
    if (this.isBusy) return;
    this.isBusy = true;
    this.loadError = false;
    this.loadedAtLeastOnce = true;

    this.responseDocumentsService
      .list(this.currentFilter())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isBusy = false)),
        catchError(() => {
          this.loadError = true;
          return of<PagedResponseDocuments>({
            content: [],
            page: 0,
            size: 0,
            totalElements: 0,
            totalPages: 0,
          });
        })
      )
      .subscribe((paged) => {
        this.documents = paged.content;
        this.totalElements = paged.totalElements;
      });
  }

  private loadSurveys(): void {
    this.surveyService
      .getAllShort()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of<SurveyDto[]>([]))
      )
      .subscribe((surveys) => (this.surveys = surveys));
  }
}

function triggerJsonDownload(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  triggerBlobDownload(blob, filename);
}

function startOfLocalDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
