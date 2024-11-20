import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { StartSurveyQuestion } from '../../../../../core/models/start-survey-question';
import { MatDialog } from '@angular/material/dialog';
import { TypeToConfirmDialogComponent } from '../type-to-confirm-dialog/type-to-confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { StartSurveyQuestionComponent } from '../start-survey-question/start-survey-question.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { START_SURVEY_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { catchError, finalize, of, throwError } from 'rxjs';
import { ButtonData } from '../buttons.ribbon/button.data';

@Component({
  selector: 'app-start-survey',
  templateUrl: './start-survey.component.html',
  styleUrl: './start-survey.component.scss'
})
export class StartSurveyComponent implements OnInit {
  questions: StartSurveyQuestion[] = [];
  @ViewChildren(StartSurveyQuestionComponent) newQuestionsComponents: QueryList<StartSurveyQuestionComponent> | undefined;
  isBusy: boolean = false;
  loadingErrorOccured: boolean = false;
  ribbonButtons: ButtonData[] = [
    {
      content: "startSurvey.refresh",
      icon: "refresh",
      onClick: () => {
        this.loadQuestions();
      }
    }
  ]

  constructor(private readonly dialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly snackbar: MatSnackBar,
    @Inject(START_SURVEY_SERVICE_TOKEN) private readonly service: StartSurveyService){}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void{
    if (this.isBusy){
      return;
    }

    this.isBusy = true;
    this.loadingErrorOccured = false;
    this.questions.length = 0;
    this.service
    .getStartSurveyQuestions()
    .pipe(
      finalize(() => {
        this.isBusy = false;
      }),
      catchError(error =>{
        if (error.status == 404){
          return of([]);
        }
        this.loadingErrorOccured = true;
        return throwError(() => error);
      }))
      .subscribe(questions => {
        questions.forEach(question => {
          this.questions.push(question);
        })
      });
  }

  addQuestion(): void {
    this.questions.push({
      order: this.questions.length + this.questions.length + 1,
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
    this.questions.splice(this.questions.indexOf(question), 1);
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
    }

    return valid;
  }

  private saveCore(): void{
    if (this.isBusy){
      return;
    }

    this.isBusy = true;

    this.adjustOrders();

    this.service.addStartSurveyQuestions(this.questions)
    .pipe(
      finalize(() => {
        this.isBusy = false;
      }),
      catchError(error =>{
        this.snackbar.open(this.translate.instant('startSurvey.addingQuestionsFailed'),
        this.translate.instant('startSurvey.ok'),
        {
          duration: 3000
        });
        return throwError(() => error);
      }))
      .subscribe(_ =>{
        this.snackbar.open(this.translate.instant('startSurvey.savedSuccesfully'),
        this.translate.instant('startSurvey.ok'),
        {
          duration: 3000
        });
      });
  }
  adjustOrders() {
    let i = 0;
    this.questions.forEach(question => {
      question.order = i++;
      let j = 0;
      question.options.forEach(option => {
        option.order = j++;
      });
    });
  }
}
