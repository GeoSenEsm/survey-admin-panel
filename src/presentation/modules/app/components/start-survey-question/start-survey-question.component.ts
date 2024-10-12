import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StartSurveyOption, StartSurveyQuestion } from '../../../../../core/models/start-survey-question';

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
}
