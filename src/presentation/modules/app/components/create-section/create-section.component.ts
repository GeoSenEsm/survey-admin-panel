import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { SectionVisibility } from '../../../../../domain/models/section.visibility';
import { QuestionType } from '../../../../../domain/models/question.type';
import { CreateQuestionModel } from '../../../../../core/models/create.question.model';
import { RespondentsGroupDto } from '../../../../../domain/models/respondents.group.dto';
import { CreateQuestionComponent } from '../create-question/create-question.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { SectionToBeTriggered } from '../../../../../core/models/section.to.be.triggered';
import { TranslateService } from '@ngx-translate/core';
import { generateGuid } from '../../../../../core/utils/guid';


@Component({
  selector: 'app-create-section',
  templateUrl: './create-section.component.html',
  styleUrl: './create-section.component.css'
})
export class CreateSectionComponent {
  SectionVisibility = SectionVisibility;
  @ViewChildren(CreateQuestionComponent) questions!: QueryList<CreateQuestionComponent>;
  @Input()
  section: CreateSectionModel | null = null;
  @Output()
  addSectionBelowEvent = new EventEmitter<CreateSectionModel>();
  @Output()
  removeSectionEvent = new EventEmitter<CreateSectionModel>();
  @Input()
  sectionsToBeTriggered: SectionToBeTriggered[] = [];
  @Input()
  sectionNumber = 0;
  nameError: string | null = null;
  questionsNumberError: string | null = null;
  sectionNameErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.nameError);
  //this guid is to identity the section in the editor, as possibly the user can create two with the same name before it is validated
  guid = generateGuid();
  
  get selectableSectionsToBeTriggered(): SectionToBeTriggered[]{
    return this.sectionsToBeTriggered.filter(section => section.sectionNumber > this.sectionNumber);
  }

  get visibility(): SectionVisibility{
    return this.section?.visibility ?? SectionVisibility.ALWAYS;
  }

  set visibility(value: SectionVisibility){
    if (this.section == null){
      return;
    }

    if (this.section.visibility !== SectionVisibility.ANSWER_TRIGGERED && value === SectionVisibility.ANSWER_TRIGGERED){
      this.sectionsToBeTriggered.push({
        sectionNumber: this.sectionNumber,
        name: this.section.name,
        guid: this.guid
      });
    }

    if (this.section.visibility === SectionVisibility.ANSWER_TRIGGERED && value !== SectionVisibility.ANSWER_TRIGGERED){
      const index = this.sectionsToBeTriggered.findIndex(section => section.guid === this.guid);
      if (index !== -1) {
        this.sectionsToBeTriggered.splice(index, 1);
      }   
    }

    this.section.visibility = value
  }

  @Input()
  respondentsGroups!: RespondentsGroupDto[];

  allVisibilities = [
    SectionVisibility.ALWAYS,
    SectionVisibility.GROUP_SPECIFIC,
    SectionVisibility.ANSWER_TRIGGERED
  ];

  get name(): string | undefined{
    return this.section?.name;
  }

  set name(value: string | undefined){
    if (this.section !== null){
      if (this.section.visibility == SectionVisibility.ANSWER_TRIGGERED){
        this.updateSectionToBeTriggered(value);
      }
      this.section.name = value;
    }
  }

  constructor(private readonly translate: TranslateService){}

  getVisibilityDisplay(visibility: SectionVisibility): string{
    switch (visibility){
      case SectionVisibility.ALWAYS:
        return this.translate.instant('createSurvey.createSection.always');
      case SectionVisibility.GROUP_SPECIFIC:
        return this.translate.instant('createSurvey.createSection.groupSpecific');
      case SectionVisibility.ANSWER_TRIGGERED:
        return this.translate.instant('createSurvey.createSection.answerTriggered');
    }
  }

  updateSectionToBeTriggered(newName: string | undefined): void{
    const idx = this.sectionsToBeTriggered.findIndex(section => section.guid === this.guid);
    if (idx !== -1) {
      this.sectionsToBeTriggered[idx].name = newName;
    }
  }

  addSectionBelow(): void{
    this.addSectionBelowEvent.emit(this.section!);
  }

  addQuestion(index: number) : void{
    
    const emptyQuestion = {
      content: this.translate.instant('createSurvey.createSection.emptyQuestion'),
      isRequired: true,
      type: QuestionType.SINGLE_TEXT_SELECTION,
      options: [],
      numberRange: {from: 0, to: 5}
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

  canRemoveQuestion(): boolean{
    return this.section!.questions.length > 1;
  }

  removeQuestion(question: CreateQuestionModel) : void{
    if (!this.canRemoveQuestion()){
      return;
    }

    const idx = this.section?.questions.indexOf(question);
    if (idx !== -1 && idx !== undefined) {
      this.section?.questions.splice(idx, 1);
    }
  }

  validateName() : void{
    this.nameError = null;
    if (this.section !== null && this.section.name!.length > 100){
      this.nameError = this.translate.instant("createSurvey.createSection.nameLenError");
    }
  }

  validateQuestionsNumber() : void{
    this.questionsNumberError = null;
    if (this.section!.questions.length == 0){
      this.questionsNumberError = this.translate.instant("createSurvey.createSection.questionsNumError");
    }
  }

  validate() : void{
    this.validateName();
    this.validateQuestionsNumber();
    this.questions.forEach(component => component.validate());
  }
  
  isValid() : boolean{
    return this.nameError == null && this.questionsNumberError == null
    && this.questions.toArray().every(component => component.isValid());
  }
}
