import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-survey-details',
  templateUrl: './survey-details.component.html',
  styleUrl: './survey-details.component.css'
})
export class SurveyDetailsComponent implements OnInit {
  surveyId: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
  }
}
