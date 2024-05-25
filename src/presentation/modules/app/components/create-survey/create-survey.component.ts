import { AfterViewInit, Component, Inject, QueryList, ViewChildren } from '@angular/core';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { SectionVisibility } from '../../../../../domain/models/section.visibility';
import { CreateSurveyModel } from '../../../../../core/models/create.survey.model';
import { QuestionType } from '../../../../../domain/models/question.type';
import { CreateSurveyDto } from '../../../../../domain/models/create.survey.dto';
import { Mapper } from '../../../../../core/mappers/mapper';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {catchError} from 'rxjs/operators'; 
import { of } from 'rxjs';
import { CreateSectionComponent } from '../create-section/create-section.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.css'
})
export class CreateSurveyComponent{
  model: CreateSurveyModel = {
    name: "Ankieta bez nazwy",
    sections: []
  };
  @ViewChildren(CreateSectionComponent) sectionComponents!: QueryList<CreateSectionComponent>;
  readonly sectionsToBeTriggered: CreateSectionModel[] = [];
  isLocked: boolean = false;
  nameValidationError: string | null = null;
  numberOfSectionsError: string | null = null;
  surveyNameErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.nameValidationError);


  constructor(@Inject('surveyMapper') private readonly surveyMapper: Mapper<CreateSurveyModel, CreateSurveyDto>,
  @Inject('surveyService') private readonly service: SurveyService,
  private readonly router: Router,
  private readonly snackbar: MatSnackBar){}

  validateName(): void{
    this.nameValidationError = null;

    if (this.model.name == null || this.model.name.trim().length === 0){
      this.nameValidationError = "Pole nie może być puste";
    }

    if (this.model.name!.length > 100){
      this.nameValidationError = "Pole nie może być dłuższe niż 100 znaków";
    }
  }

  private validateNumberOfSections(): void{
    if (this.model.sections.length === 0){
      this.numberOfSectionsError = "Ankieta musi zawierać co najmniej jedną sekcję";
    }
  }

  private isValid(): boolean{
    this.validateName();
    this.validateNumberOfSections();
    this.sectionComponents.forEach(component => {
      component.validate();
    });
    return this.nameValidationError == null && this.numberOfSectionsError == null
    && this.sectionComponents.toArray().every(component => component.isValid());
  } 

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

  save(){
    if (this.isLocked){
      return;
    }
    this.isLocked = true;
    
    if (!this.isValid()){
      this.isLocked = false;
      return;
    }

    const dto = this.surveyMapper.map(this.model);
    
    this.service.createSurvey(dto)
    .pipe(catchError((error) => {
      this.snackbar.open('Something went wrong', 'OK', {duration: 3000});
      this.isLocked  = false;
      return of('');
    }))
    .subscribe(res =>{
      if (res === ''){
        return;
      }
      this.isLocked = false;
      this.snackbar.open('Survey has been created', 'OK', {duration: 3000});
      this.router.navigate(['/']);
    });
  }
}
