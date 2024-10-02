import { Component, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { SurveyDetailsDto } from '../../../../../domain/models/survey.details.dtos';
import { finalize, map } from 'rxjs';
import { CreateSurveyModel } from '../../../../../core/models/create.survey.model';
import { SURVEY_DETAILS_MAPPER } from '../../../../../core/services/registration.names';
import { Mapper } from '../../../../../core/mappers/mapper';

@Component({
  selector: 'app-survey-preview',
  standalone: false,
  templateUrl: './survey-preview.component.html',
  styleUrl: './survey-preview.component.scss'
})
export class SurveyPreviewComponent implements OnChanges{
  @Input()
  surveyId!: string | null;
  isLoadingSurvey: boolean = false;
  loadingSurveyStatusCode: number = -1;
  model!: CreateSurveyModel;


  constructor(@Inject('surveyService') private readonly service: SurveyService,
 @Inject(SURVEY_DETAILS_MAPPER) private readonly mapper: Mapper<SurveyDetailsDto, CreateSurveyModel>){
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['surveyId'] && this.surveyId) {
      this.reloadSurvey();
    }
  }

  private reloadSurvey(): void {
    this.isLoadingSurvey = true;
    this.loadingSurveyStatusCode = -1;
    
    if (!this.surveyId){
      return;
    }

    this.service.getSurveyById(this.surveyId)
      .pipe(
        map(result =>{
          return this.mapper.map(result);
        }),
        finalize(() => {
          this.isLoadingSurvey = false;
        })
      )
      .subscribe({
        next: (model) => {
          this.model = model;
          this.loadingSurveyStatusCode = 200;
        },
        error: (error) => {
          this.loadingSurveyStatusCode = error.status || 500; 
          console.log(this.loadingSurveyStatusCode);
          console.log(error.message);
        }
      });
  }
}