import { Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import { of, Subscription } from 'rxjs';
import { CreateSectionComponent } from '../create-section/create-section.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { RespondentGroupsService } from '../../../../../domain/external_services/respondent.groups.service';
import { RespondentsGroupDto } from '../../../../../domain/models/respondents.group.dto';
import { SectionToBeTriggered } from '../../../../../core/models/section.to.be.triggered';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.css'
})
export class CreateSurveyComponent implements OnInit, OnDestroy{
  model: CreateSurveyModel = {
    name: this.translate.instant('createSurvey.createSurvey.defaultSurveyName'),
    sections: []
  };
  @ViewChildren(CreateSectionComponent) sectionComponents!: QueryList<CreateSectionComponent>;
  readonly sectionsToBeTriggered: SectionToBeTriggered[] = [];
  isLocked: boolean = false;
  nameValidationError: string | null = null;
  numberOfSectionsError: string | null = null;
  surveyNameErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.nameValidationError);
  groups: RespondentsGroupDto[] = [];
  private readonly langChangeSubscription: Subscription;


  constructor(@Inject('surveyMapper') private readonly surveyMapper: Mapper<CreateSurveyModel, CreateSurveyDto>,
  @Inject('surveyService') private readonly service: SurveyService,
  private readonly router: Router,
  private readonly snackbar: MatSnackBar,
  @Inject('respondentGroupsService') private readonly respondentGroupsService: RespondentGroupsService,
  private readonly translate: TranslateService){
    this.langChangeSubscription = translate.onLangChange.subscribe((event) => {
      this.loadGroups();
    })
  }
  
  ngOnInit(): void {
    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
  }

  private loadGroups(): void{
    this.groups.length = 0;
    this.respondentGroupsService
    .getRespondentsGroups()
    .subscribe(res =>{
      res.forEach(g =>{
          this.groups.push(g);
      })
    });
  }

  validateName(): void{
    this.nameValidationError = null;

    if (this.model.name == null || this.model.name.trim().length === 0){
      this.nameValidationError = this.translate.instant('createSurvey.createSurvey.nameNotEmptyError');
    }

    if (this.model.name!.length > 100){
      this.nameValidationError = this.translate.instant('createSurvey.createSurvey.nameLenError');
    }
  }

  private validateNumberOfSections(): void{
    this.numberOfSectionsError = null;
    if (this.model.sections.length === 0){
      this.numberOfSectionsError = this.translate.instant('createSurvey.createSurvey.sectionsNumError');
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
      name: this.translate.instant('createSurvey.createSurvey.defaultSectionName'),
      visibility: SectionVisibility.ALWAYS,
      questions: [
        {
          content: this.translate.instant('createSurvey.createSurvey.defaultQuestionContent'),
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
    console.log(dto);
    this.service.createSurvey(dto)
    .pipe(catchError((error) => {
      this.snackbar.open(this.translate.instant('createSurvey.createSurvey.somethingWentWrong'), 
        this.translate.instant('createSurvey.createSurvey.ok'), 
        {duration: 3000}
      );
      this.isLocked  = false;
      return of('');
    }))
    .subscribe(res =>{
      if (res === ''){
        return;
      }
      this.isLocked = false;
      this.snackbar.open(this.translate.instant('createSurvey.createSurvey.successfullyCreatedSurvey'), 
        this.translate.instant('createSurvey.createSurvey.ok'), 
        {duration: 3000}
      );
      this.router.navigate(['/']);
    });
  }
}
