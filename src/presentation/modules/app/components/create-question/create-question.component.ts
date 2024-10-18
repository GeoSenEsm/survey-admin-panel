import { Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { CreateQuestionModel } from '../../../../../core/models/create.question.model';
import { QuestionType } from '../../../../../domain/models/question-type';
import { CreateTextSelectionOptionsComponent } from '../create-text-selection-options/create-text-selection-options.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { SectionToBeTriggered } from '../../../../../core/models/section.to.be.triggered';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.css'
})
export class CreateQuestionComponent {
  QuestionType = QuestionType;
  @ViewChild(CreateTextSelectionOptionsComponent) textSelectionOptions: CreateTextSelectionOptionsComponent | null = null;
  @Input()
  question: CreateQuestionModel | null = null;
  @Output()
  addQuestionBelowEvent = new EventEmitter<CreateQuestionModel>();
  @Output()
  removeEvent = new EventEmitter<CreateQuestionModel>();
  @Input()
  sectionsToBeTriggered: SectionToBeTriggered[] = [];
  contentError: string | null = null;
  contentErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.contentError);
  @Input()
  isReadOnly: boolean = false;

  allQuestionTypes = [
    QuestionType.SINGLE_CHOICE,
    QuestionType.LINEAR_SCALE,
    QuestionType.YES_NO_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.NUMBER_INPUT
  ];

  questionTypeIconSelector = {
    [QuestionType.SINGLE_CHOICE]: 'radio_button_checked',
    [QuestionType.LINEAR_SCALE]: 'linear_scale',
    [QuestionType.YES_NO_CHOICE]: 'check',
    [QuestionType.MULTIPLE_CHOICE]: 'check_box',
    [QuestionType.NUMBER_INPUT]: 'filter_5'
  };

  questionTypeDisplay = {
    [QuestionType.SINGLE_CHOICE]: 'createSurvey.createQuestion.singleChoice',
    [QuestionType.LINEAR_SCALE]: 'createSurvey.createQuestion.linearScale',
    [QuestionType.YES_NO_CHOICE]: 'createSurvey.createQuestion.yesNo',
    [QuestionType.MULTIPLE_CHOICE]: 'createSurvey.createQuestion.multipleChoice',
    [QuestionType.NUMBER_INPUT]: 'createSurvey.createQuestion.number'
  };

  constructor(readonly translate: TranslateService){}

  addQuestionBelow(): void {
    this.addQuestionBelowEvent.emit(this.question!);
  }

  remove(): void {
    this.removeEvent.emit(this.question!);
  }

  isValid(): boolean{
    const isValid = this.contentError == null &&
     (this.question?.type !== QuestionType.SINGLE_CHOICE 
      || this.textSelectionOptions?.isValid() === true);

    return isValid;
  }

  validate(): void{
    this.validateContent();

    if (this.question?.type == QuestionType.SINGLE_CHOICE){
      this.textSelectionOptions?.validate();
    }
  }

  validateContent(){
    this.contentError = null;
    if (this.question?.content == null || this.question.content.trim().length === 0){
      this.contentError = this.translate.instant('app.addRespondents.contentNotEmptyError');
      return;
    }

    if (this.question.content.length > 250){
      this.contentError = this.translate.instant('app.addRespondents.contentLenError');
    }
  }
}
