import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SensorDataValue, SensorDataEntry } from '../../../../../domain/models/sensor-data-entry';
import { DatePipe } from '@angular/common';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { TranslateService } from '@ngx-translate/core';
import { SENSOR_DATA_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { SensorDataService } from '../../../../../domain/external_services/sensor-data.service';
import { SensorDataFilter } from '../../../../../domain/models/sensor-data-filter';
import { catchError, finalize, throwError } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-sensor-data',
  templateUrl: './sensor-data.component.html',
  styleUrl: './sensor-data.component.scss',
})
export class SensorDataComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  readonly headers = ['dateTime', 'source', 'values', 'respondentId', 'surveyId'];
  isBusy: boolean = false;
  loadDataError: boolean = false;
  dataSource: MatTableDataSource<SensorDataEntry> = undefined!;
  resultEntries: SensorDataEntry[] = [];
  respondents: RespondentData[] = [];
  loadedAtLeastOnce: boolean = false;
  downloadedBytes: number = 0;
  readonly valuesTransformers: { [key: string]: (property: any) => any } = {
    dateTime: (property: any) => {
      return this.datePipe.transform(new Date(property), 'short');
    },
    values: (property: SensorDataValue[]) => {
      if (!Array.isArray(property)) return '';
      return property.map((v) => `${v.parameterCode}: ${v.value}`).join(', ');
    },
    surveyId: (property: string | null) => property ?? '-',
  };

  get canExport(): boolean {
    return this.resultEntries.length > 0;
  }

  constructor(
    private readonly datePipe: DatePipe,
    private readonly exportService: CsvExportService,
    private readonly translate: TranslateService,
    @Inject(SENSOR_DATA_SERVICE_TOKEN)
    private readonly service: SensorDataService,
    @Inject('respondentDataService')
    private readonly respondentsService: RespondentDataService
  ) {}
  ngOnInit(): void {
    this.loadRespondents();
  }

  exportToCsv(): void {
    const filename = this.translate.instant('sensorData.gridExportFilename');
    // exportTableToCSV stringifies array/object cells with Array.prototype.join, which would
    // otherwise turn `values` (an array of {parameterCode, value}) into "[object Object]"; run
    // every cell through the same display transform used on-screen so the export matches what's
    // actually shown.
    const rows = this.dataSource.data.map((row) => {
      const displayRow: Record<string, unknown> = {};
      this.headers.forEach((column) => {
        displayRow[column] = this.getActualColumnDisplay((row as any)[column], column);
      });
      return displayRow;
    });
    this.exportService.exportTableToCSV(rows, this.headers, filename);
  }

  getActualColumnDisplay(propertyValue: any, columnName: string): any {
    if (this.valuesTransformers[columnName]) {
      return this.valuesTransformers[columnName](propertyValue);
    }
    return propertyValue;
  }

  loadData(filters: SensorDataFilter): void {
    if (this.isBusy) {
      return;
    }

    this.loadedAtLeastOnce = true;
    this.isBusy = true;
    this.loadDataError = false;
    this.downloadedBytes = 0;

    // Clear previous results immediately
    this.resultEntries = [];
    this.dataSource = this.createDataSource(this.resultEntries);

    this.service
      .getSensorDataWithProgress(filters)
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
            result.forEach((e) => {
              this.resultEntries.push(e);
            });
            this.dataSource = this.createDataSource(this.resultEntries);
          }
        }
      });
  }

  /**
   * The default MatTableDataSource sort comparator compares raw cell values, which coerces the
   * `values` column (an array of {parameterCode, value} objects) to the same "[object Object],..."
   * string for every row with an equal reading count — sorting that column would be a visible
   * no-op. Sort by the same display transform shown on-screen instead, for every column.
   */
  private createDataSource(data: SensorDataEntry[]): MatTableDataSource<SensorDataEntry> {
    const dataSource = new MatTableDataSource<SensorDataEntry>(data);
    dataSource.sortingDataAccessor = (row, column) =>
      this.getActualColumnDisplay((row as any)[column], column);
    if (this.paginator) {
      dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      dataSource.sort = this.sort;
    }
    return dataSource;
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

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
