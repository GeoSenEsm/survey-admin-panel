import { AfterViewInit, Component, Inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { SurveyDetailsDto } from '../../../../../domain/models/survey.details.dtos';
import { finalize, map } from 'rxjs';
import { CreateSurveyModel } from '../../../../../core/models/create.survey.model';
import { SURVEY_DETAILS_MAPPER } from '../../../../../core/services/registration-names';
import { Mapper } from '../../../../../core/mappers/mapper';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { TypeToConfirmDialogComponent } from '../type-to-confirm-dialog/type-to-confirm-dialog.component';
import { CreateSurveyComponent } from '../create-survey/create-survey.component';
import { SectionVisibility } from '../../../../../domain/models/section.visibility';

@Component({
  selector: 'app-survey-preview',
  standalone: false,
  templateUrl: './survey-preview.component.html',
  styleUrl: './survey-preview.component.scss'
})
export class SurveyPreviewComponent implements OnChanges, AfterViewInit{
  @ViewChild(CreateSurveyComponent) createSurveyComponent?: CreateSurveyComponent;
  @Input()
  surveyId!: string | null;
  isLoadingSurvey: boolean = false;
  loadingSurveyStatusCode: number = -1;
  model!: CreateSurveyModel;
  detailsDto!: SurveyDetailsDto;
  editMode: boolean = false;
  changesMade = false;


  constructor(@Inject('surveyService') private readonly service: SurveyService,
 @Inject(SURVEY_DETAILS_MAPPER) private readonly mapper: Mapper<SurveyDetailsDto, CreateSurveyModel>,
  private readonly router: Router,
  private readonly snackbar: MatSnackBar,
  private readonly translate: TranslateService,
  private readonly dialog: MatDialog){
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['surveyId'] && this.surveyId) {
      this.reloadSurvey();
    }
  }

  ngAfterViewInit(): void {
    this.prepareSectionsToBeTriggered();
  }

  private prepareSectionsToBeTriggered(): void {
    if (this.createSurveyComponent){
      this.createSurveyComponent.sectionsToBeTriggered.length = 0;
      this.createSurveyComponent.sectionComponents.forEach((component) => {
        if (component.visibility == SectionVisibility.ANSWER_TRIGGERED) {
          this.createSurveyComponent!.sectionsToBeTriggered.push({
            sectionNumber: component.sectionNumber,
            guid: component.guid,
            name: component.name
          });
        }
      });
    }
  }

  reloadSurvey(): void {
    this.isLoadingSurvey = true;
    this.loadingSurveyStatusCode = -1;
    this.editMode = false;
    this.changesMade = false;
    
    if (!this.surveyId){
      return;
    }

    this.service.getSurveyById(this.surveyId)
      .pipe(
        map(result =>{
          return [result, this.mapper.map(result)];
        }),
        finalize(() => {
          this.isLoadingSurvey = false;
        })
      )
      .subscribe({
        next: ([result, model]) => {
          this.model = model as CreateSurveyModel;
          this.detailsDto = result as SurveyDetailsDto;
          this.loadingSurveyStatusCode = 200;
          this.prepareSectionsToBeTriggered();
        },
        error: (error) => {
          this.loadingSurveyStatusCode = error.status || 500; 
          console.log(this.loadingSurveyStatusCode);
          console.log(error.message);
        }
      });
  }

  toggleEditMode(): void{
    if (this.detailsDto.state == 'published'){
      this.editMode = false;
    }
    this.editMode = !this.editMode;
  }


  publishSurvey(): void{
    if (this.detailsDto.state == 'published' || this.surveyId == null){
      return;
    }

    this.dialog.open(TypeToConfirmDialogComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      data:{
        informationText: this.translate.instant('surveyDetails.publishInformationText'),
        textToType: this.translate.instant('surveyDetails.publishConfirmationInput')
      }
    })
    .afterClosed()
    .subscribe(res =>{
      if (res === true){
        this.publishSurveyCore();
      }
    });    
  }

  private publishSurveyCore(): void{
    this.service.publish(this.surveyId!)
    .subscribe({
      next: _ => {
        this.snackbar.open(this.translate.instant('surveyDetails.successfullyPublishedSurvey'), 
        this.translate.instant('surveyDetails.ok'), {duration: 3000});
        this.reloadSurvey();
      },
      error: (error) => {
        console.log(error);
        this.snackbar.open(this.translate.instant('surveyDetails.errorOnPublishingSurvey'), 
        this.translate.instant('surveyDetails.ok'), {duration: 3000});
      }
    })
  }

  deleteSurvey(): void{
    if (this.detailsDto.state == 'published' || this.surveyId == null){
      return;
    }

    this.dialog.open(TypeToConfirmDialogComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      data:{
        informationText: this.translate.instant('surveyDetails.deleteInformationText'),
        textToType: this.translate.instant('surveyDetails.deleteConfirmationInput')
      }
    })
    .afterClosed()
    .subscribe(res =>{
      if (res === true){
        this.deleteSurveyCore();
      }
    });    
  }

  private deleteSurveyCore(): void{
    this.service.deleteSurvey(this.surveyId!)
    .subscribe({
      next: _ => {
        this.snackbar.open(this.translate.instant('surveyDetails.successfullyDeletedSurvey'), 
        this.translate.instant('surveyDetails.ok'), {duration: 3000});
        this.router.navigate(['surveys']);
      },
      error: (error) => {
        console.log(error);
        this.snackbar.open(this.translate.instant('surveyDetails.errorOnDeletingSurvey'), 
        this.translate.instant('surveyDetails.ok'), {duration: 3000});
      }
    });
  }

  setChangesMade(): void{
    this.changesMade = true;
  }
}