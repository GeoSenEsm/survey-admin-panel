import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { SectionVisibility } from '../../../../../domain/models/section.visibility';
import { QuestionType } from '../../../../../domain/models/question.type';
import { CreateQuestionModel } from '../../../../../core/models/create.question.model';
import { TextSelectionOption } from '../../../../../core/models/text.selection.option';
import { RespondentsGroupDto } from '../../../../../domain/models/respondents.group.dto';


@Component({
  selector: 'app-create-section',
  templateUrl: './create-section.component.html',
  styleUrl: './create-section.component.css'
})
export class CreateSectionComponent {
  @Input()
  section: CreateSectionModel | null = null;
  @Output()
  addSectionBelowEvent = new EventEmitter<CreateSectionModel>();
  @Output()
  removeSectionEvent = new EventEmitter<CreateSectionModel>();
  @Input()
  sectionsToBeTriggered: CreateSectionModel[] = [];

  get visibility(): SectionVisibility{
    return this.section?.visibility ?? SectionVisibility.ALWAYS;
  }

  set visibility(value: SectionVisibility){
    if (this.section == null){
      return;
    }

    if (this.section.visibility !== SectionVisibility.ANSWER_TRIGGERED && value === SectionVisibility.ANSWER_TRIGGERED){
      this.sectionsToBeTriggered.push(this.section);
    }

    if (this.section.visibility === SectionVisibility.ANSWER_TRIGGERED && value !== SectionVisibility.ANSWER_TRIGGERED){
      this.sectionsToBeTriggered.splice(this.sectionsToBeTriggered.indexOf(this.section), 1);
    }

    this.section.visibility = value
  }

  respondentsGroups: RespondentsGroupDto[] = [
    {
      id: "1",
      name: "Group 1"
    },
    {
      id: "2",
      name: "Group 2"
    },
  ];

  visibilityDisplaySelector = {
    [SectionVisibility.ALWAYS]: 'Zawsze',
    [SectionVisibility.GROUP_SPECIFIC]: 'Grupowy',
    [SectionVisibility.ANSWER_TRIGGERED]: 'Po zaznaczeniu właściwej odpowiedzi'
  };

  allVisibilities = [
    SectionVisibility.ALWAYS,
    SectionVisibility.GROUP_SPECIFIC,
    SectionVisibility.ANSWER_TRIGGERED
  ];

  addSectionBelow(): void{
    this.addSectionBelowEvent.emit(this.section!);
  }

  addQuestion(index: number) : void{
    
    const emptyQuestion = {
      isRequired: true,
      type: QuestionType.SINGLE_TEXT_SELECTION,
      options: [],
      numberRange: {from: 0, to: 5, step: 1, sectionVisibilityTrigger: {}}
    };
    this.section?.questions.splice(index, 0, emptyQuestion);
  }

  addQuestionBelow(model: CreateQuestionModel) : void{
    const idx = this.section?.questions.indexOf(model);
    if (idx !== -1 && idx !== undefined) {
      this.addQuestion(idx + 1);
    }
  }

  remove() : void{
    this.removeSectionEvent.emit(this.section!);
  }

  removeQuestion(question: CreateQuestionModel) : void{
    const idx = this.section?.questions.indexOf(question);
    if (idx !== -1 && idx !== undefined) {
      this.section?.questions.splice(idx, 1);
    }
  }
}
