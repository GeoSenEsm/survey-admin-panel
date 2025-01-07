import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TemperatureDataEntry } from '../../../../../domain/models/temperature-data-entry';
import { DatePipe } from '@angular/common';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { TranslateService } from '@ngx-translate/core';
import { TEMPERATURE_DATA_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { TemperatureDataService } from '../../../../../domain/external_services/temperature-data.service';
import { TemperatureDataFilter } from '../../../../../domain/models/temperature-data-filter';
import { catchError, finalize, throwError } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';

@Component({
  selector: 'app-temprature-data',
  templateUrl: './temprature-data.component.html',
  styleUrl: './temprature-data.component.scss',
})
export class TempratureDataComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  readonly headers = ['dateTime', 'temperature', 'humidity', 'respondentId'];
  isBusy: boolean = false;
  loadDataError: boolean = false;
  dataSource: MatTableDataSource<TemperatureDataEntry> = undefined!;
  resultEntries: TemperatureDataEntry[] = [];
  respondents: RespondentData[] = [];
  loadedAtLeastOnce: boolean = false;
  readonly valuesTransformers: { [key: string]: (property: any) => any } = {
    dateTime: (property: any) => {
      return this.datePipe.transform(new Date(property), 'short');
    },
  };

  get canExport(): boolean {
    return this.resultEntries.length > 0;
  }

  constructor(
    private readonly datePipe: DatePipe,
    private readonly exportService: CsvExportService,
    private readonly translate: TranslateService,
    @Inject(TEMPERATURE_DATA_SERVICE_TOKEN)
    private readonly service: TemperatureDataService,
    @Inject('respondentDataService')
    private readonly respondentsService: RespondentDataService
  ) {}
  ngOnInit(): void {
    this.loadRespondents();
  }

  exportToCsv(): void {
    const filename = this.translate.instant('temperature.gridExportFilename');
    this.exportService.exportTableToCSV(
      this.dataSource.data,
      this.headers,
      filename
    );
  }

  getActualColumnDisplay(propertyValue: any, columnName: string): any {
    if (this.valuesTransformers[columnName]) {
      return this.valuesTransformers[columnName](propertyValue);
    }
    return propertyValue;
  }

  loadData(filters: TemperatureDataFilter): void {
    if (this.isBusy) {
      return;
    }

    this.loadedAtLeastOnce = true;
    this.isBusy = true;
    this.loadDataError = false;
    this.resultEntries.length = 0;
    this.service
      .getTemperatureData(filters)
      .pipe(
        finalize(() => (this.isBusy = false)),
        catchError((error) => {
          this.loadDataError = true;
          return throwError(() => error);
        })
      )
      .subscribe((result) => {
        result.forEach((e) => {
          this.resultEntries.push(e);
        });
        this.dataSource = new MatTableDataSource<TemperatureDataEntry>(
          this.resultEntries
        );
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
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
}
