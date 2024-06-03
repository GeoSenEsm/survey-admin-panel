import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HistogramDataDto } from '../../../../../domain/models/histogram.data.dto';

@Component({
  selector: 'app-survey-summary',
  templateUrl: './survey-summary.component.html',
  styleUrl: './survey-summary.component.css'
})
export class SurveySummaryComponent implements OnInit{
  surveyId: string | null = null;
  histograms: HistogramDataDto[] = [
    {
      title: 'Jak oceniasz jakieś zagadnienie?',
      series: [
        { label: 'Nie wiem', value: 10 },
        { label: 'Zdecydowanie nie', value: 30 },
        { label: 'Raczej nie', value: 50 },
        { label: 'Raczej tak', value: 80 },
        { label: 'Zdecydowanie tak', value: 2 }
      ]
    }
  ];

  constructor(private readonly route: ActivatedRoute){} 

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
  }
}
