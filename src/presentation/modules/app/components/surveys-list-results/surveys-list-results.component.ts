import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { SUMMARIES_SERVICE } from '../../../../../core/services/registration-names';
import { SummariesService } from '../../../../../domain/external_services/summaries.service';
import { SurveyResultsFilter } from '../../../../../domain/models/survey-results-filter';
import { SurveyResultEntry } from '../../../../../domain/models/survey-result-entry';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-surveys-list-results',
  templateUrl: './surveys-list-results.component.html',
  styleUrl: './surveys-list-results.component.css'
})
export class SurveysListResultsComponent implements AfterViewInit{
  readonly headers = [
    'surveyName', 'question', 'responseDate', 'answers', 'respondentId'
  ];
  private isBusy: boolean = false;
  loadDataError: boolean = false;
  dataSource: MatTableDataSource<SurveyResultEntry> = undefined!;
  resultEntries: SurveyResultEntry[] = [];

  constructor(@Inject(SUMMARIES_SERVICE) private readonly summariesService: SummariesService){}
  
  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<SurveyResultEntry>(this.resultEntries);
  }
  
  loadTableData(filters: SurveyResultsFilter): void{
    if (this.isBusy){
      return;
    }
    this.isBusy = true;
    this.loadDataError = false;
    this.resultEntries.length = 0;
    this.summariesService.getTableResults(filters)
    .pipe(
      finalize(() => this.isBusy = false),
      catchError(error => {
        this.loadDataError = true;
        return throwError(() => error);
      })
    ).subscribe(result =>{
      result.forEach(e => {
        this.resultEntries.push(e);
        this.dataSource = new MatTableDataSource<SurveyResultEntry>(this.resultEntries);
      })
    });
  }
  
}
