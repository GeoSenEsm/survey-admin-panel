import { Component, Input } from '@angular/core';
import { SurveyDto } from '../../../../../domain/models/survey.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey-summary-tile',
  templateUrl: './survey-summary-tile.component.html',
  styleUrl: './survey-summary-tile.component.css'
})
export class SurveySummaryTileComponent {
  @Input()
  survey!: SurveyDto; 

  selectedDate: Date | null = null;

  dates = [
    new Date('2023-01-01'),
    new Date('2023-02-14'),
    new Date('2023-03-17'),
    new Date('2023-04-01'),
    new Date('2023-05-25'),
    new Date('2023-12-25')
  ];

  constructor(private readonly router: Router) {
  }

  navigateToSummary(): void{
    if (this.selectedDate == null){
      return;
    }

    this.router.navigate([`/summaries/${this.survey.id}`], {
      queryParams: {
        date: this.selectedDate.toISOString()
      }
    });
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
