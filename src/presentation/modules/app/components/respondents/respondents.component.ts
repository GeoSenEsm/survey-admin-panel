import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddRespondentsComponent } from '../add-respondents/add-respondents.component';
import { ButtonData } from '../buttons.ribbon/button.data';
import { RespondentData, RespondentFilters } from '../../../../../domain/models/respondent-data';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { convertToValueDisplayMappings, RespondentInfoCollections, RespondentInfoValueDisplayMappings } from '../../../../../domain/models/respondent-info';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, forkJoin, of, throwError } from 'rxjs';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { EditRespondentDataComponent } from '../edit-respondent-data/edit-respondent-data.component';

@Component({
  selector: 'app-respondents',
  standalone: false,
  templateUrl: './respondents.component.html',
  styleUrl: './respondents.component.css'
})
export class RespondentsComponent 
implements AfterViewInit{
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource: MatTableDataSource<RespondentData> = null!;
  readonly respondents: RespondentData[] = [];
  headers: string[] | undefined;
  directDisplayColumns = new Set<string>(['username', 'id']);
  columnFilter: { [key: string]: string[] } = {};
  respondentInfos: RespondentInfoCollections = null!;
  valueDisplayMappings: RespondentInfoValueDisplayMappings = null!;
  isBusy = false;
  readonly ribbonButtons: ButtonData[] = [
    {
      content: 'respondents.respondents.refresh',
      onClick: this.reloadRespondents.bind(this),
      icon: 'refresh'
    },
    {
      content: 'respondents.respondents.createRespondentsAccounts',
      onClick: this.generateRespondentsAccounts.bind(this)
    },
    {
      content: 'respondents.respondents.export',
      onClick: this.exportToCsv.bind(this),
      icon: 'file_download',
      disabled: () => this.respondents.length == 0
    }
  ];
  loadingErrorOccured = false;
  filters: RespondentFilters;

  constructor(@Inject('dialog') private readonly _dialog: MatDialog,
    @Inject('respondentDataService')private readonly service: RespondentDataService,
    private readonly translate: TranslateService,
    private readonly exportService: CsvExportService){
      const now = new Date();
      this.filters = {
        amount: 1,
        from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7)),
        to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 20))
      }
  }

  ngAfterViewInit(): void {
    this.loadData();
    if (this.dataSource) {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
    this.dataSource = new MatTableDataSource<RespondentData>(this.respondents);
  }

  loadData(): void{
    if (this.isBusy){
      return;
    }

    this.isBusy = true;
    this.respondents.length = 0;
    const observables = [
      this.service.getRespondentInfoCollections(),
      this.service.getRespondents()
    ];

    forkJoin(observables).pipe(
      finalize(() => {
        this.isBusy = false;
      }),
      catchError(e =>{
        if (e.status == 404){
          return of([[], []]);
        }

        return throwError(() => e);
      })
    ).subscribe({
      next: ([respondentInfos, respondents]) => {
        this.loadingErrorOccured = false;
        this.respondentInfos = respondentInfos as RespondentInfoCollections;
        this.headers = ['id', 'username'].concat(Object.keys(this.respondentInfos));
        this.valueDisplayMappings = convertToValueDisplayMappings(this.respondentInfos);
        (respondents as RespondentData[]).forEach(r => this.respondents.push(r));
      },
      error: () => {
        this.loadingErrorOccured = true;
      }
    });
  }

  reloadRespondents(): void{
    if (this.isBusy){
      return;
    }
    console.log(this.filters);
    this.isBusy = true;
    this.respondents.length = 0;
    this.service.getRespondents()
    .pipe(
      finalize(() => {
        this.isBusy = false;
      }),
    ).subscribe(res => {
      (res as RespondentData[]).forEach(r => this.respondents.push(r));
    });
  }

  generateRespondentsAccounts(): void{
    this._dialog.open(AddRespondentsComponent, {
      hasBackdrop: true,
      closeOnNavigation: false
    })
  }

  getActualCellDisplay(respondent: RespondentData, columnName: string): string | undefined{
    if (this.directDisplayColumns.has(columnName)){
      return respondent[columnName];
    }

    return this.valueDisplayMappings[columnName]?.get(respondent[columnName]);
  }

  getActualHeaderDisplay(columnName: string): string | undefined{
    if (columnName == 'id'){
      return 'ID';
    }

    if (columnName == 'username'){
      return this.translate.instant('respondents.respondents.usernameColumnHeader');
    }

    return columnName;
  }

  exportToCsv(): void{
    if (this.headers && this.respondents.length > 0){
      const filename = this.translate.instant("respondents.respondents.gridExportFilename");
      const actualCells = this.dataSource.data.map(r => {
        const cells: { [key: string]: string } = {};
        Object.keys(r).forEach(h => {
          cells[h] = this.getActualCellDisplay(r, h) || '';
        });
        return cells;
      });
      this.exportService.exportTableToCSV(actualCells, this.headers, filename);
    }
  }

  edit(respondent: RespondentData): void{
    this._dialog.open(EditRespondentDataComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      data: respondent
    })
  }
}