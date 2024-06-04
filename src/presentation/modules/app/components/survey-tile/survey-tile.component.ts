import { Component, Input } from '@angular/core';
import { SurveyDto } from '../../../../../domain/models/survey.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey-tile',
  templateUrl: './survey-tile.component.html',
  styleUrl: './survey-tile.component.css'
})
export class SurveyTileComponent {
  @Input()
  survey!: SurveyDto; 

  constructor(private readonly router: Router) {
  }

  navigateToDetails(): void{
    this.router.navigate([`/surveys/${this.survey.id}`]);
  }
}
