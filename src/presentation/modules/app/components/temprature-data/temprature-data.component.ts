import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TemperatureDataEntry } from '../../../../../domain/models/temperature-data-entry';
import { DatePipe } from '@angular/common';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-temprature-data',
  templateUrl: './temprature-data.component.html',
  styleUrl: './temprature-data.component.scss'
})
export class TempratureDataComponent {
  readonly headers = [
    'respondentId', 'dateTime', 'temperature'
  ];
  isBusy: boolean = false;
  loadDataError: boolean = false;
  dataSource: MatTableDataSource<TemperatureDataEntry> = undefined!;
  resultEntries: TemperatureDataEntry[] = [];
  loadedAtLeastOnce: boolean = false;
  readonly valuesTransformers: { [key: string]: (property: any) => any } = {
    date: (property: any) => {
      return this.datePipe.transform(new Date(property), 'short', 'UTC');
    }
  };

  constructor(private readonly datePipe: DatePipe,
              private readonly exportService: CsvExportService,
              private readonly translate: TranslateService){}

  exportToCsv(): void{
    const filename = this.translate.instant("temperature.gridExportFilename");
    this.exportService.exportTableToCSV(this.dataSource.data, this.headers, filename);
  }

  getActualColumnDisplay(propertyValue: any, columnName: string): any{
    if (this.valuesTransformers[columnName]){
      return this.valuesTransformers[columnName](propertyValue);
    }
    return propertyValue;
  }
}
