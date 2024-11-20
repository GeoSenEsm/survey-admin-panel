import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { StartSurveyOption, StartSurveyQuestion } from '../../../../../core/models/start-survey-question';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { TranslateService } from '@ngx-translate/core';
import { StartSurveyQuestionOptionComponent } from '../start-survey-question-option/start-survey-question-option.component';

@Component({
  selector: 'app-start-survey-question',
  templateUrl: './start-survey-question.component.html',
  styleUrl: './start-survey-question.component.scss'
})
export class StartSurveyQuestionComponent {
  @Input() question: StartSurveyQuestion | undefined = undefined;
  @Input() isReadOnly: boolean = false;
  readonly maxInputLen = 250;
  @Output() removeQuestionCallback = new EventEmitter<StartSurveyQuestion>();
  @Input() allQuestions: StartSurveyQuestion[] | undefined = undefined;
  questionError: string | null = null
  questionContentErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.questionError);
  @ViewChildren(StartSurveyQuestionOptionComponent) optionComponents: QueryList<StartSurveyQuestionOptionComponent> | undefined;

  constructor(private readonly translate: TranslateService){}

  addOption(): void {
    if (this.question) {
      this.question.options.push({ order: this.question.options.length + 1, content: '' });
    }
  }

  removeOption(option: StartSurveyOption){
    if (this.question) {
      this.question.options = this.question.options.filter(e => e !== option);
    }
  }

  removeQusetion(): void{
    if (this.question) {
      this.removeQuestionCallback.emit(this.question);
    }
  }

  validate(): boolean{
    const questionValid = this.validateQuestion();
    let allOptionsValid = true;
    this.optionComponents?.forEach((optionComponent) => {
      if (!optionComponent.validateOption()){
        allOptionsValid = false;
      }
    })
    return questionValid && allOptionsValid;
  }

  validateQuestion(): boolean{
    if (this.isReadOnly){
      return true;
    }

    this.questionError = null;

    if (!this.question){
      return true;
    }

    if (this.question.content.length == 0){
      this.questionError = this.translate.instant('startSurvey.questionCannotBeEmpty');
      return false;
    }

    if ((this.allQuestions && this.allQuestions.find(e => e != this.question && e.content.trim() == this.question!.content.trim()))){
      this.questionError = this.translate.instant('startSurvey.questionAlreadyExists');
      return false;
    }

    return true;
  }

  down(): void{
    if (!this.allQuestions || !this.question){
      return;
    }

    const index = this.allQuestions.indexOf(this.question);
  
    if (index > -1 && index < this.allQuestions.length - 1) {
      const temp = this.allQuestions[index];
      this.allQuestions[index] = this.allQuestions[index + 1];
      this.allQuestions[index + 1] = temp;
    }
  }

  up(): void{
    if (!this.allQuestions || !this.question){
      return;
    }

    const index = this.allQuestions.indexOf(this.question);
  
    if (index > 0) {
      const temp = this.allQuestions[index];
      this.allQuestions[index] = this.allQuestions[index - 1];
      this.allQuestions[index - 1] = temp;
    }
  }
}
