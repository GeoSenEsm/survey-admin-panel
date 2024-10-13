import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { StartSurveyQuestion } from '../../../../../core/models/start-survey-question';
import { MatDialog } from '@angular/material/dialog';
import { TypeToConfirmDialogComponent } from '../type-to-confirm-dialog/type-to-confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { StartSurveyQuestionComponent } from '../start-survey-question/start-survey-question.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-start-survey',
  templateUrl: './start-survey.component.html',
  styleUrl: './start-survey.component.scss'
})
export class StartSurveyComponent implements OnInit {
  oldQuestions: StartSurveyQuestion[] = [];
  newQuestions: StartSurveyQuestion[] = [];
  @ViewChildren(StartSurveyQuestionComponent) newQuestionsComponents: QueryList<StartSurveyQuestionComponent> | undefined;

  constructor(private readonly dialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly snackbar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef){}

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
    if (!this.validate()){
      return;
    }

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

  private validate(): boolean{
    let valid = true;
    this.newQuestionsComponents?.forEach((questionComponent) => {
      if (!questionComponent.isReadOnly && !questionComponent.validate()){
        valid = false;
      }
    });

    if (!valid){
      this.snackbar.open(this.translate.instant('startSurvey.thereAreValidationErrors'),
      this.translate.instant('startSurvey.ok'),
      {duration: 3000});
      this.cdr.detectChanges();
    }

    return valid;
  }

  private saveCore(): void{
    this.newQuestions.forEach(question =>{
      this.oldQuestions.push(question);
    });
    this.newQuestions.length = 0;
  }
}
