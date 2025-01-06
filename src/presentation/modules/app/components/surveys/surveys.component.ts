import { Component, Inject, OnInit } from '@angular/core';
import { ButtonData } from '../buttons.ribbon/button.data';
import { Router } from '@angular/router';
import { SurveyDto } from '../../../../../domain/models/survey.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrl: './surveys.component.css',
})
export class SurveysComponent implements OnInit {
  surveys: SurveyDto[] = [];
  isBusy = false;
  loadingErrorOccured = false;

  constructor(
    private readonly router: Router,
    @Inject('surveyService') private readonly surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    if (this.isBusy){
      return;
    }
    this.isBusy = true;
    this.surveys.length = 0;
    this.loadingErrorOccured = false;

    
    this.surveyService.getAllShort()
    .pipe(finalize(() => (this.isBusy = false)))
    .subscribe({
      next: (result) => {
        result.forEach((survey) => {
          this.surveys.push(survey);
        });
      },
      error: (error) => {
        console.log(error);
        this.loadingErrorOccured = true;
      }
    });
  }

  createNew(): void {
    this.router.navigate(['surveys/new']);
  }
}
