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
    [QuestionType.SINGLE_TEXT_SELECTION]: 'Odpowiedź tekstowa (pojedynczy wybór)',
    [QuestionType.DISCRETE_NUMBER_RANGE_SELECTION]: 'Odpowiedź liczbowa (zakres dyskretny)'
  }

  addQuestionBelow(): void {
    this.addQuestionBelowEvent.emit(this.question!);
  }

  remove(): void {
    this.removeEvent.emit(this.question!);
  }
}
