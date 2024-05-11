import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateQuestionModel } from '../../../../../core/models/create.question.model';
import { QuestionType } from '../../../../../domain/models/question.type';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.css'
})
export class CreateQuestionComponent {
  @Input()
  question: CreateQuestionModel | null = null;
  @Output()
  addQuestionBelowEvent = new EventEmitter<CreateQuestionModel>();
  @Output()
  removeEvent = new EventEmitter<CreateQuestionModel>();

  allQuestionTypes = [
    QuestionType.SINGLE_TEXT_SELECTION
  ]

  questionTypeDisplaySelector = {
    [QuestionType.SINGLE_TEXT_SELECTION]: 'Single text selection'
  }

  addQuestionBelow(): void {
    this.addQuestionBelowEvent.emit(this.question!);
  }

  remove(): void {
    this.removeEvent.emit(this.question!);
  }
}
