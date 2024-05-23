import { Component } from '@angular/core';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { SectionVisibility } from '../../../../../domain/models/section.visibility';
import { CreateSurveyModel } from '../../../../../core/models/create.survey.model';
import { QuestionType } from '../../../../../domain/models/question.type';

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.css'
})
export class CreateSurveyComponent {
  model: CreateSurveyModel = {
    name: "Ankieta bez nazwy",
    sections: []
  };

  readonly sectionsToBeTriggered: CreateSectionModel[] = [];

  addSection(index: number) : void{
    const newSection = {
      name: 'Sekcja bez nazwy',
      visibility: SectionVisibility.ALWAYS,
      questions: [
        {
          content: 'Pytanie',
          isRequired: true,
          type: QuestionType.SINGLE_TEXT_SELECTION,
          options: [],
          numberRange: {from: 0, to: 5, step: 1, sectionVisibilityTrigger: {}}
        }
      ]
    };
    this.model.sections.splice(index, 0, newSection);
  }

  addSectionBelow(anotherSection: CreateSectionModel) : void{
    const idx = this.model.sections.indexOf(anotherSection);
    if (idx !== -1){
      this.addSection(idx + 1);
    }
  }

  removeSection(section: CreateSectionModel) : void{
    const idx = this.model.sections.indexOf(section);
    if (idx !== -1){
      this.model.sections.splice(idx, 1);
    }
  }
}
