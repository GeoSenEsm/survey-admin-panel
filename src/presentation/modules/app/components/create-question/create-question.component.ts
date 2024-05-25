import { Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { CreateQuestionModel } from '../../../../../core/models/create.question.model';
import { QuestionType } from '../../../../../domain/models/question.type';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { CreateTextSelectionOptionsComponent } from '../create-text-selection-options/create-text-selection-options.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.css'
})
export class CreateQuestionComponent {
  @ViewChild(CreateTextSelectionOptionsComponent) textSelectionOptions: CreateTextSelectionOptionsComponent | null = null;
  @Input()
  question: CreateQuestionModel | null = null;
  @Output()
  addQuestionBelowEvent = new EventEmitter<CreateQuestionModel>();
  @Output()
  removeEvent = new EventEmitter<CreateQuestionModel>();
  @Input()
  sectionsToBeTriggered: CreateSectionModel[] = [];
  contentError: string | null = null;
  contentErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.contentError);

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

  isValid(): boolean{
    const isValid = this.contentError == null &&
     (this.question?.type !== QuestionType.SINGLE_TEXT_SELECTION 
      || this.textSelectionOptions?.isValid() === true);

    return isValid;
  }

  validate(): void{
    this.validateContent();

    if (this.question?.type == QuestionType.SINGLE_TEXT_SELECTION){
      this.textSelectionOptions?.validate();
    }
  }

  validateContent(){
    this.contentError = null;
    if (this.question?.content == null || this.question.content.trim().length === 0){
      this.contentError = "Pole nie może być puste";
      return;
    }

    if (this.question.content.length > 250){
      this.contentError = "Pole nie może być dłuższe niż 250 znaków";
    }
  }
}
