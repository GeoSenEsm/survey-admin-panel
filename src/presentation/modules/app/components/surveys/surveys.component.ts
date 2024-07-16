import { Component, Inject, OnInit } from '@angular/core';
import { ButtonData } from '../buttons.ribbon/button.data';
import { Router } from '@angular/router';
import { SurveyDto } from '../../../../../domain/models/survey.dto';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrl: './surveys.component.css'
})
export class SurveysComponent implements OnInit{

  surveys: SurveyDto[] = [];


  ribbonButtons: ButtonData[] = [
    {
      content: 'Dodaj ankietę',
      onClick: this.createNew.bind(this)
    }
  ]

  constructor(private readonly router: Router,
    @Inject('surveyService')private readonly surveyService: SurveyService,
    private readonly translate: TranslateService){
      this.translate
      .get('surveyDetails.surveys.addSurvey')
      .subscribe((res: string) =>{
        this.ribbonButtons[0].content = res;
      });
    }
  
  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void{
    this.surveys.length = 0;

    this.surveyService
    .getAllShort()
    .subscribe(result =>{
      result.forEach(survey =>{
        this.surveys.push(survey);
      });
    });
  }

  createNew(): void{
    this.router.navigate(['surveys/new']);
  }
}
