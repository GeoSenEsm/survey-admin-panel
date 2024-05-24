import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateQuestionModel } from '../../../../../core/models/create.question.model';
import { QuestionType } from '../../../../../domain/models/question.type';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';

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
  @Input()
  sectionsToBeTriggered: CreateSectionModel[] = [];

  allQuestionTypes = [
    QuestionType.SINGLE_TEXT_SELECTION,
    QuestionType.DISCRETE_NUMBER_RANGE_SELECTION
  ]

  questionTypeDisplaySelector = {
    [QuestionType.SINGLE_TEXT_SELECTION]: 'Jednokrotny wybór',
    [QuestionType.DISCRETE_NUMBER_RANGE_SELECTION]: 'Skala liniowa'
  }

  questionTypeIconSelector = {
    [QuestionType.SINGLE_TEXT_SELECTION]: 'radio_button_checked',
    [QuestionType.DISCRETE_NUMBER_RANGE_SELECTION]: 'linear_scale'
  }

  addQuestionBelow(): void {
    this.addQuestionBelowEvent.emit(this.question!);
  }

  remove(): void {
    this.removeEvent.emit(this.question!);
  }
}
