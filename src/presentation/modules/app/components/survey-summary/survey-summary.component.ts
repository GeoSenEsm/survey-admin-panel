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
    },
    {
      title: 'Jak oceniasz poziom obsługi klienta?',
      series: [
        { label: 'Nie wiem', value: 15 },
        { label: 'Zdecydowanie nie', value: 25 },
        { label: 'Raczej nie', value: 40 },
        { label: 'Raczej tak', value: 70 },
        { label: 'Zdecydowanie tak', value: 5 }
      ]
    },
    {
      title: 'Jak oceniasz jakość produktu?',
      series: [
        { label: 'Nie wiem', value: 5 },
        { label: 'Zdecydowanie nie', value: 20 },
        { label: 'Raczej nie', value: 35 },
        { label: 'Raczej tak', value: 60 },
        { label: 'Zdecydowanie tak', value: 10 }
      ]
    },
    {
      title: 'Jak oceniasz czas dostawy?',
      series: [
        { label: 'Nie wiem', value: 8 },
        { label: 'Zdecydowanie nie', value: 22 },
        { label: 'Raczej nie', value: 30 },
        { label: 'Raczej tak', value: 55 },
        { label: 'Zdecydowanie tak', value: 12 }
      ]
    },
    {
      title: 'Jak oceniasz wygląd strony internetowej?',
      series: [
        { label: 'Nie wiem', value: 12 },
        { label: 'Zdecydowanie nie', value: 18 },
        { label: 'Raczej nie', value: 28 },
        { label: 'Raczej tak', value: 50 },
        { label: 'Zdecydowanie tak', value: 20 }
      ]
    }
];

  constructor(private readonly route: ActivatedRoute){} 

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
  }
}
