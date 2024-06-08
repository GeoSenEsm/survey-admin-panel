import { Component, Input } from '@angular/core';
import { SurveyDto } from '../../../../../domain/models/survey.dto';
import { Router } from '@angular/router';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';

@Component({
  selector: 'app-survey-summary-tile',
  templateUrl: './survey-summary-tile.component.html',
  styleUrl: './survey-summary-tile.component.css'
})
export class SurveySummaryTileComponent {
  @Input()
    survey!: SurveySummaryShortDto;
    selectedDate: Date | null = null;

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
