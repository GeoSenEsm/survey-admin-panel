import { Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { CreateQuestionModel } from '../../../../../core/models/create.question.model';
import { QuestionType } from '../../../../../domain/models/question-type';
import { CreateTextSelectionOptionsComponent } from '../create-text-selection-options/create-text-selection-options.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { SectionToBeTriggered } from '../../../../../core/models/section.to.be.triggered';
import { TranslateService } from '@ngx-translate/core';
import { CreateImageOptionsComponent } from '../create-image-options/create-image-options.component';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.css'
})
export class CreateQuestionComponent {
  QuestionType = QuestionType;
  @ViewChild(CreateTextSelectionOptionsComponent) textSelectionOptions: CreateTextSelectionOptionsComponent | null = null;
  @ViewChild(CreateImageOptionsComponent) imageOptionsComponent: CreateImageOptionsComponent | null = null;
  @Input()
  question: CreateQuestionModel | null = null;
  @Output()
  addQuestionBelowEvent = new EventEmitter<CreateQuestionModel>();
  @Output()
  removeEvent = new EventEmitter<CreateQuestionModel>();
  @Output()
  upCallback = new EventEmitter<CreateQuestionModel>();
  @Output()
  downCallback = new EventEmitter<CreateQuestionModel>();
  @Input()
  sectionsToBeTriggered: SectionToBeTriggered[] = [];
  contentError: string | null = null;
  contentErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.contentError);
  @Input()
  isReadOnly: boolean = false;
  @Output() changed = new EventEmitter<void>();

  allQuestionTypes = [
    QuestionType.SINGLE_CHOICE,
    QuestionType.LINEAR_SCALE,
    QuestionType.YES_NO_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.NUMBER_INPUT,
    QuestionType.IMAGE_CHOICE
  ];

  questionTypeIconSelector = {
    [QuestionType.SINGLE_CHOICE]: 'radio_button_checked',
    [QuestionType.LINEAR_SCALE]: 'linear_scale',
    [QuestionType.YES_NO_CHOICE]: 'check',
    [QuestionType.MULTIPLE_CHOICE]: 'check_box',
    [QuestionType.NUMBER_INPUT]: 'filter_5',
    [QuestionType.IMAGE_CHOICE]: 'image'
  };

  questionTypeDisplay = {
    [QuestionType.SINGLE_CHOICE]: 'createSurvey.createQuestion.singleChoice',
    [QuestionType.LINEAR_SCALE]: 'createSurvey.createQuestion.linearScale',
    [QuestionType.YES_NO_CHOICE]: 'createSurvey.createQuestion.yesNo',
    [QuestionType.MULTIPLE_CHOICE]: 'createSurvey.createQuestion.multipleChoice',
    [QuestionType.NUMBER_INPUT]: 'createSurvey.createQuestion.number',
    [QuestionType.IMAGE_CHOICE]: 'createSurvey.createQuestion.image'
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
      || this.textSelectionOptions?.isValid() === true)
      && (this.question?.type !== QuestionType.IMAGE_CHOICE
        || this.imageOptionsComponent?.validate() === true
      );

    return isValid;
  }

  validate(): void{
    this.validateContent();

    if (this.question?.type == QuestionType.SINGLE_CHOICE){
      this.textSelectionOptions?.validate();
    }

    if (this.question?.type == QuestionType.IMAGE_CHOICE){
      this.imageOptionsComponent?.validate();
    }
  }

  validateContent(){
    this.contentError = null;
    if (this.question?.content == null || this.question.content.trim().length === 0){
      this.contentError = this.translate.instant('createSurvey.createQuestion.contentNotEmptyError');
      return;
    }

    if (this.question.content.length > 250){
      this.contentError = this.translate.instant('createSurvey.createQuestion.contentLenError');
    }
  }

  up(): void{
    this.upCallback.emit(this.question!);
  }

  down(): void{
    this.downCallback.emit(this.question!);
  }
}
