import { Component, OnInit } from '@angular/core';
import { StartSurveyQuestion } from '../../../../../core/models/start-survey-question';

@Component({
  selector: 'app-start-survey',
  templateUrl: './start-survey.component.html',
  styleUrl: './start-survey.component.scss'
})
export class StartSurveyComponent implements OnInit {
  oldQuestions: StartSurveyQuestion[] = [];
  newQuestions: StartSurveyQuestion[] = [];

  ngOnInit(): void {
    //here I'll load the old questions
    this.oldQuestions = [
      {
        order: 0,
        content: 'old question 1',
        options: [
          {
            order: 0,
            content: 'old option 1'
          },
          {
            order: 1,
            content: 'old option 2'
          },
          {
            order: 2,
            content: 'old option 3'
          }
        ]
      },
      {
        order: 1,
        content: 'old question 2',
        options: [
          {
            order: 0,
            content: 'old option 1'
          },
          {
            order: 1,
            content: 'old option 2'
          },
          {
            order: 2,
            content: 'old option 3'
          }
        ]
      }
    ]
  }

  addQuestion(): void {
    this.newQuestions.push({
      order: this.oldQuestions.length + this.newQuestions.length + 1,
      content: '',
      options: [
        {
          order: 1,
          content: ''
        }
      ]
    });
  }

  removeQuestion(question: StartSurveyQuestion): void {
    this.newQuestions.splice(this.newQuestions.indexOf(question), 1);
  }
}
