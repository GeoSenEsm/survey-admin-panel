import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddRespondentsComponent } from '../add-respondents/add-respondents.component';
import { ButtonData } from '../buttons.ribbon/button.data';
import { RespondentData } from '../../../../../domain/models/respondent.data';
import { RespondentDataService } from '../../../../../domain/external_services/respondent.data.servce';
import { convertToValueDisplayMappings, getMapForProperty, RespondentInfoCollections, RespondentInfoValueDisplayMappings } from '../../../../../domain/models/respondent.info';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-respondents',
  standalone: false,
  templateUrl: './respondents.component.html',
  styleUrl: './respondents.component.css'
})
export class RespondentsComponent 
implements AfterViewInit, OnInit{
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource?: MatTableDataSource<RespondentData>;
  respondents: RespondentData[] = [];
  readonly headers = [
    'username',
    'gender',
    'ageCategoryId',
    'occupationId',
    'educationCategoryId',
    'healthConditionId',
    'medicationUseId',
    'lifeSatisfactionId',
    'stressLevelId',
    'qualityOfSleepId'
  ];
  headerTranslationMappings: { [key: string]: string } = {
    'username': 'respondents.respondents.usernameColumnHeader',
    'gender': 'respondents.respondents.sexColumnHeader',
    'ageCategoryId': 'respondents.respondents.ageCategoryColumnHeader',
    'occupationCategoryId': 'respondents.respondents.occupationColumnHeader',
    'educationCategoryId': 'respondents.respondents.educationColumnHeader',
    'healthConditionId': 'respondents.respondents.healthStatusColumnHeader',
    'medicationUseId': 'respondents.respondents.medicationUseColumnHeader',
    'lifeSatisfactionId': 'respondents.respondents.lifeSatisfactionColumnHeader',
    'stressLevelId': 'respondents.respondents.stressLevelColumnHeader',
    'qualityOfSleepId': 'respondents.respondents.qualityOfSleepColumnHeader'
  }
  translatableColumns = new Set<string>(['gender']);
  directDisplayColumns = new Set<string>(['username']);
  columnFilter: { [key: string]: string[] } = {};
  respondentInfos: RespondentInfoCollections = null!;
  valueDisplayMappings: RespondentInfoValueDisplayMappings = null!;

  ribbonButtons: ButtonData[] = [
    {
      content: 'respondents.respondents.refresh',
      onClick: this.loadData.bind(this)
    },
    {
      content: 'respondents.respondents.createRespondentsAccounts',
      onClick: this.generateRespondentsAccounts.bind(this)
    }
  ];

  constructor(@Inject('dialog') private readonly _dialog: MatDialog,
    @Inject('respondentDataService')private readonly service: RespondentDataService,
    private readonly translate: TranslateService){
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void{
    this.loadRespondents();
    this.loadRespondentInfos();
  }

  private loadRespondentInfos(): void{
    this.service.getRespondentInfoCollections()
    .subscribe(res => {
      this.respondentInfos = res;
      this.valueDisplayMappings = convertToValueDisplayMappings(res);
    });
  }

  private loadRespondents(): void{
    this.service.getRespondents()
    .subscribe(res => {
      this.respondents = res;
      this.dataSource = new MatTableDataSource<RespondentData>(this.respondents);
    });
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
  }

  generateRespondentsAccounts(): void{
    this._dialog.open(AddRespondentsComponent, {
      hasBackdrop: true,
      closeOnNavigation: false
    })
  }

  getActualCellDisplay(respondent: RespondentData, columnName: string): string | undefined{
    if (this.translatableColumns.has(columnName)){
      return this.translate.instant(`componentless.${(respondent as any)[columnName]}`);
    }

    if (this.directDisplayColumns.has(columnName)){
      return (respondent as any)[columnName];
    }

    return getMapForProperty(columnName, this.valueDisplayMappings)?.get((respondent as any)[columnName]);
  }

}
