import { Component, OnInit } from '@angular/core';
import { StartSurveyQuestion } from '../../../../../core/models/start-survey-question';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationData, TypeToConfirmDialogComponent } from '../type-to-confirm-dialog/type-to-confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-start-survey',
  templateUrl: './start-survey.component.html',
  styleUrl: './start-survey.component.scss'
})
export class StartSurveyComponent implements OnInit {
  oldQuestions: StartSurveyQuestion[] = [];
  newQuestions: StartSurveyQuestion[] = [];

  constructor(private readonly dialog: MatDialog,
    private readonly translate: TranslateService){}

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

  save(): void{
    this.dialog.open(TypeToConfirmDialogComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      data:{
        informationText: this.translate.instant('startSurvey.saveInformationText'),
        textToType: this.translate.instant('startSurvey.saveConfirmationInput')
      }
    })
    .afterClosed()
    .subscribe(res =>{
      if (res === true){
        this.saveCore();
      }
    });
  }

  private saveCore(): void{
    this.newQuestions.forEach(question =>{
      this.oldQuestions.push(question);
    });
    this.newQuestions.length = 0;
  }
}
