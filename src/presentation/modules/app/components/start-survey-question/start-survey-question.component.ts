import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StartSurveyOption, StartSurveyQuestion } from '../../../../../core/models/start-survey-question';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { TranslateService } from '@ngx-translate/core';

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
  @Input() allOldQuestions: StartSurveyQuestion[] | undefined = undefined;
  @Input() allNewQuestions: StartSurveyQuestion[] | undefined = undefined;
  questionError: string | null = null
  questionContentErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.questionError);

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

  validateQuestion(): void{
    this.questionError = null;

    if (!this.question){
      return;
    }

    if (this.question.content.length == 0){
      this.questionError = this.translate.instant('startSurvey.questionCannotBeEmpty');
      return;
    }

    if ((this.allOldQuestions && this.allOldQuestions.find(e => e != this.question && e.content.trim() == this.question!.content.trim()))
    || (this.allNewQuestions && this.allNewQuestions.find(e => e != this.question && e.content.trim() == this.question!.content.trim()))){
      this.questionError = this.translate.instant('startSurvey.questionAlreadyExists');
    }
  }
}
