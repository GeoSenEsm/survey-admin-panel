import { Component } from '@angular/core';
import { SurveyDto } from '../../../../../domain/models/survey.dto';

@Component({
  selector: 'app-surveys-list-results',
  templateUrl: './surveys-list-results.component.html',
  styleUrl: './surveys-list-results.component.css'
})
export class SurveysListResultsComponent {
  surveys: SurveyDto[] = [
    {
      id: "123",
      name: 'Testowa ankieta 2'
    },
    {
      id: "123",
      name: 'Testowa ankieta 2'
    }
  ]
}
