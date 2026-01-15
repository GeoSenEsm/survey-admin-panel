import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { SUMMARIES_SERVICE } from '../../../../../core/services/registration-names';
import { SummariesService } from '../../../../../domain/external_services/summaries.service';
import { SurveyResultsFilter } from '../../../../../domain/models/survey-results-filter';
import { SurveyResultEntry } from '../../../../../domain/models/survey-result-entry';
import { MatTableDataSource } from '@angular/material/table';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-surveys-list-results',
  templateUrl: './surveys-list-results.component.html',
  styleUrl: './surveys-list-results.component.css',
})
export class SurveysListResultsComponent implements AfterViewInit, OnInit {
  public get respondentsService(): RespondentDataService {
    return this._respondentsService;
  }
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  readonly headers = [
    'surveyName',
    'question',
    'responseDate',
    'answers',
    'respondentName',
    'longitude',
    'latitude',
    'accuracyMeters',
    'outsideResearchArea',
    'temperature',
    'humidity',
    'respondentId'
  ];
  isBusy: boolean = false;
  loadDataError: boolean = false;
  dataSource: MatTableDataSource<SurveyResultEntry> = undefined!;
  resultEntries: SurveyResultEntry[] = [];
  loadedAtLeastOnce: boolean = false;
  respondents: RespondentData[] = [];
  downloadedBytes: number = 0;

  get canExport(): boolean {
    return this.resultEntries.length > 0;
  }
  readonly valuesTransformers: { [key: string]: (property: any) => any } = {
    responseDate: (property: any) => {
      return this.datePipe.transform(new Date(property), 'short');
    },
  };

  constructor(
    @Inject(SUMMARIES_SERVICE)
    private readonly summariesService: SummariesService,
    private readonly exportService: CsvExportService,
    private readonly translate: TranslateService,
    private readonly datePipe: DatePipe,
    @Inject('respondentDataService')
    private readonly _respondentsService: RespondentDataService
  ) {}
  ngOnInit(): void {
    this.loadRespondents();
  }

  ngAfterViewInit(): void {
    this.assignDataDource();
  }

  assignDataDource(): void {
    this.dataSource = new MatTableDataSource<SurveyResultEntry>(
      this.resultEntries
    );
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadTableData(filters: SurveyResultsFilter): void {
    if (this.isBusy) {
      return;
    }
    this.loadedAtLeastOnce = true;
    this.isBusy = true;
    this.loadDataError = false;
    this.downloadedBytes = 0;

    // Clear previous results immediately
    this.resultEntries = [];
    this.assignDataDource();

    this.summariesService
      .getTableResultsWithProgress(filters)
      .pipe(
        finalize(() => {
          this.isBusy = false;
          this.downloadedBytes = 0;
        }),
        catchError((error) => {
          this.loadDataError = true;
          return throwError(() => error);
        })
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          // Update downloaded bytes
          this.downloadedBytes = event.loaded;
        } else if (event.type === HttpEventType.Response) {
          // Data fully loaded
          const result = event.body;
          if (result && Array.isArray(result)) {
            result.forEach((single: any) => {
              this.resultEntries.push({
                surveyName: single.surveyName,
                question: single.question,
                responseDate: single.responseDate,
                answers: single.answers,
                respondentId: single.respondentId,
                longitude: single.localizationData?.longitude,
                latitude: single.localizationData?.latitude,
                outsideResearchArea: single.localizationData?.outsideResearchArea,
                temperature: single.sensorData?.temperature,
                humidity: single.sensorData?.humidity,
                accuracyMeters: single.localizationData?.accuracyMeters
              });
            });
          }
          this.assignDataDource();
        }
      });
  }

    loadRespondents(): void {
      this.respondentsService
        .getRespondents(undefined)
        .pipe(
          catchError((error) => {
            return throwError(() => new Error(error));
          })
        )
        .subscribe({
          next: (res) => {
            this.respondents = res;
          },
        });
    }

  exportToCsv(): void {
    const filename = this.translate.instant(
      'summary.surveySummary.gridExportFilename'
    );
    console.log(this.dataSource.data);
    this.exportService.exportTableToCSV(
      this.dataSource.data,
      this.headers,
      filename
    );
  }

  getActualColumnDisplay(answer: SurveyResultEntry, propertyValue: any, columnName: string): any {
    if (columnName == 'respondentName') {
      return this.respondents.find(
        (r) => r.id == answer.respondentId
      )?.username;
    }

    if (this.valuesTransformers[columnName]) {
      return this.valuesTransformers[columnName](propertyValue);
    }
    return propertyValue;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
