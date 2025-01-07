import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AddRespondentsComponent } from '../add-respondents/add-respondents.component';
import { ButtonData } from '../buttons.ribbon/button.data';
import {
  RespondentData,
  RespondentFilters,
} from '../../../../../domain/models/respondent-data';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import {
  convertToValueDisplayMappings,
  RespondentInfoCollections,
  RespondentInfoValueDisplayMappings,
} from '../../../../../domain/models/respondent-info';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, forkJoin, of, throwError } from 'rxjs';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { EditRespondentDataComponent } from '../edit-respondent-data/edit-respondent-data.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { NavigationExtras, Router } from '@angular/router';
import { START_SURVEY_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { InitialSurveyState } from '../../../../../core/models/start-survey-question';

@Component({
  selector: 'app-respondents',
  standalone: false,
  templateUrl: './respondents.component.html',
  styleUrl: './respondents.component.css',
})
export class RespondentsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource: MatTableDataSource<RespondentData> = null!;
  readonly respondents: RespondentData[] = [];
  headers: string[] = [];
  directDisplayColumns = new Set<string>(['username', 'id']);
  columnFilter: { [key: string]: string[] } = {};
  respondentInfos: RespondentInfoCollections = null!;
  valueDisplayMappings: RespondentInfoValueDisplayMappings = null!;
  isBusy = false;
  readonly ribbonButtons: ButtonData[] = [
    {
      content: 'respondents.respondents.refresh',
      onClick: this.reloadRespondents.bind(this),
      icon: 'refresh',
    },
    {
      content: 'respondents.respondents.createRespondentsAccounts',
      onClick: this.generateRespondentsAccounts.bind(this),
    },
    {
      content: 'respondents.respondents.export',
      onClick: this.exportToCsv.bind(this),
      icon: 'file_download',
      disabled: () => this.respondents.length == 0,
    },
  ];
  loadingErrorOccured = false;
  filters: RespondentFilters;
  initialSurveyState: InitialSurveyState = 'not_created';

  constructor(
    @Inject('dialog') private readonly _dialog: MatDialog,
    @Inject('respondentDataService')
    private readonly service: RespondentDataService,
    private readonly translate: TranslateService,
    private readonly exportService: CsvExportService,
    private readonly router: Router,
    @Inject(START_SURVEY_SERVICE_TOKEN)
    private readonly initialSurveyService: StartSurveyService
  ) {
    const now = new Date();
    this.filters = {
      amount: 1,
      from: new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7)
      ),
      to: new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 20)
      ),
    };
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<RespondentData>([]);
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator!;
    this.dataSource.sort = this.sort!;
  }

  loadData(): void {
    if (this.isBusy) {
      return;
    }

    this.isBusy = true;
    this.respondents.length = 0;
    this.dataSource.data = [];
    const observables = [
      this.service.getRespondentInfoCollections().pipe(
        catchError((e) => {
          if (e.status == 404) {
            return of({} as RespondentInfoCollections);
          }
          return throwError(() => e);
        })
      ),
      this.service.getRespondents(this.filters),
      this.initialSurveyService.getState(),
    ];

    forkJoin(observables)
      .pipe(
        finalize(() => {
          this.isBusy = false;
        }),
        catchError((e) => {
          if (e.status == 404) {
            return of([[], []]);
          }

          return throwError(() => e);
        })
      )
      .subscribe({
        next: ([respondentInfos, respondents, initialSurveyState]) => {
          this.loadingErrorOccured = false;
          this.respondentInfos = respondentInfos as RespondentInfoCollections;
          this.headers = ['username']
            .concat(Object.keys(this.respondentInfos))
            .concat(['id']);
          this.valueDisplayMappings = convertToValueDisplayMappings(
            this.respondentInfos
          );
          (respondents as RespondentData[]).forEach((r) =>
            this.respondents.push(r)
          );
          this.respondents.sort((a, b) => a.username.localeCompare(b.username));
          this.dataSource.data = this.respondents;
          console.log(this.dataSource.data);
          this.initialSurveyState = initialSurveyState as InitialSurveyState;
        },
        error: () => {
          this.loadingErrorOccured = true;
        },
      });
  }

  reloadRespondents(): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.respondents.length = 0;
    this.dataSource.data = [];
    this.service
      .getRespondents(this.filters)
      .pipe(
        finalize(() => {
          this.isBusy = false;
        })
      )
      .subscribe((res) => {
        (res as RespondentData[]).forEach((r) => this.respondents.push(r));
        this.dataSource.data = this.respondents;
      });
  }

  generateRespondentsAccounts(): void {
    this._dialog.open(AddRespondentsComponent, {
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        onRespondentsCreated: () => this.reloadRespondents(),
      },
    });
  }

  getActualCellDisplay(
    respondent: RespondentData,
    columnName: string
  ): string | undefined {
    if (this.directDisplayColumns.has(columnName)) {
      return respondent[columnName];
    }

    return this.valueDisplayMappings[columnName]?.get(respondent[columnName]);
  }

  getActualHeaderDisplay(columnName: string): string | undefined {
    if (columnName == 'id') {
      return 'ID';
    }

    if (columnName == 'username') {
      return this.translate.instant(
        'respondents.respondents.usernameColumnHeader'
      );
    }

    return columnName;
  }

  exportToCsv(): void {
    if (this.headers && this.respondents.length > 0) {
      const filename = this.translate.instant(
        'respondents.respondents.gridExportFilename'
      );
      const actualCells = this.dataSource.data.map((r) => {
        const cells: { [key: string]: string } = {};
        Object.keys(r).forEach((h) => {
          cells[h] = this.getActualCellDisplay(r, h) || '';
        });
        return cells;
      });
      this.exportService.exportTableToCSV(actualCells, this.headers, filename);
    }
  }

  edit(respondent: RespondentData): void {
    this._dialog.open(EditRespondentDataComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      data: respondent,
    });
  }

  changePassword(respondent: RespondentData): void {
    this._dialog.open(ChangePasswordComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      data: respondent,
    });
  }

  goToSurveryResults(respondent: RespondentData): void {
    this.router.navigate(
      [`/summaries`],
      this.respondentNavigationExtras(respondent)
    );
  }

  private respondentNavigationExtras(
    respondent: RespondentData
  ): NavigationExtras {
    return {
      queryParams: {
        respondent: respondent.username,
      },
    };
  }

  goToMap(respondent: RespondentData): void {
    this.router.navigate([`/map`], this.respondentNavigationExtras(respondent));
  }

  goToSensorData(respondent: RespondentData): void {
    this.router.navigate(
      [`/temperature`],
      this.respondentNavigationExtras(respondent)
    );
  }

  canEditRespondents(): boolean {
    return this.initialSurveyState == 'published';
  }
}
