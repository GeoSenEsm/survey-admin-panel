import { Component, Input } from '@angular/core';
import { SurveyDto } from '../../../../../domain/models/survey.dto';

@Component({
  selector: 'app-survey-tile',
  templateUrl: './survey-tile.component.html',
  styleUrl: './survey-tile.component.css'
})
export class SurveyTileComponent {
  @Input()
  survey!: SurveyDto; 
}
