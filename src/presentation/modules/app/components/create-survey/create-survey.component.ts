import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { SectionVisibility } from '../../../../../domain/models/section.visibility';
import { CreateSurveyModel } from '../../../../../core/models/create.survey.model';
import { QuestionType } from '../../../../../domain/models/question-type';
import { CreateSurveyDto } from '../../../../../domain/models/create.survey.dto';
import { Mapper } from '../../../../../core/mappers/mapper';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';
import { CreateSectionComponent } from '../create-section/create-section.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { RespondentGroupsService } from '../../../../../domain/external_services/respondent.groups.service';
import { RespondentsGroupDto } from '../../../../../domain/models/respondents.group.dto';
import { SectionToBeTriggered } from '../../../../../core/models/section.to.be.triggered';
import { TranslateService } from '@ngx-translate/core';

export type SurveyEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.scss',
})
export class CreateSurveyComponent implements OnInit, OnDestroy {
  @Input()
  model: CreateSurveyModel = {
    name: this.translate.instant('createSurvey.createSurvey.defaultSurveyName'),
    sections: [],
  };
  @ViewChildren(CreateSectionComponent)
  sectionComponents!: QueryList<CreateSectionComponent>;
  readonly sectionsToBeTriggered: SectionToBeTriggered[] = [];
  isLocked: boolean = false;
  nameValidationError: string | null = null;
  numberOfSectionsError: string | null = null;
  surveyNameErrorStateMatcher: ErrorStateMatcher =
    new FormlessErrorStateMatcher(() => this.nameValidationError);
  groups: RespondentsGroupDto[] = [];
  @Input()
  isReadOnly: boolean = false;
  @Output() changed: EventEmitter<void> = new EventEmitter();
  @Input()
  mode: SurveyEditorMode = 'create';
  @Output()
  saved = new EventEmitter<CreateSurveyModel>();
  @Input() id?: string | null;
  existingSurveyNames: string[] = [];
  readonly langChangeSubscription: Subscription;

  constructor(
    @Inject('surveyMapper')
    private readonly surveyMapper: Mapper<CreateSurveyModel, CreateSurveyDto>,
    @Inject('surveyService') private readonly service: SurveyService,
    private readonly router: Router,
    private readonly snackbar: MatSnackBar,
    @Inject('respondentGroupsService')
    private readonly respondentGroupsService: RespondentGroupsService,
    private readonly translate: TranslateService
  ) {
    this.langChangeSubscription = this.translate.onLangChange.subscribe((_) => {
      if (this.model.name == 'createSurvey.createSurvey.defaultSurveyName') {
        this.model.name = this.translate.instant(
          'createSurvey.createSurvey.defaultSurveyName'
        );
      }
    });
  }
  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadGroups();
    this.loadExistingSurveys();
  }

  private loadGroups(): void {
    this.groups.length = 0;
    this.respondentGroupsService.getRespondentsGroups().subscribe((res) => {
      res.forEach((g) => {
        this.groups.push(g);
      });
      this.validateName();
    });
  }

  private loadExistingSurveys(): void {
    this.existingSurveyNames.length = 0;
    this.service.getAllShort().subscribe((res) => {
      res.forEach((s) => {
        this.existingSurveyNames.push(s.name);
      });
    });
  }

  validateName(): void {
    this.nameValidationError = null;

    if (this.model.name == null || this.model.name.trim().length === 0) {
      this.nameValidationError = this.translate.instant(
        'createSurvey.createSurvey.nameNotEmptyError'
      );
      return;
    }

    if (this.model.name!.length > 100) {
      this.nameValidationError = this.translate.instant(
        'createSurvey.createSurvey.nameLenError'
      );
    }

    if (
      this.mode == 'create' &&
      this.existingSurveyNames.includes(this.model.name!)
    ) {
      this.nameValidationError = this.translate.instant(
        'createSurvey.createSurvey.nameMustBeUnique'
      );
    }
  }

  private validateNumberOfSections(): void {
    this.numberOfSectionsError = null;
    if (this.model.sections.length === 0) {
      this.numberOfSectionsError = this.translate.instant(
        'createSurvey.createSurvey.sectionsNumError'
      );
    }
  }

  private isValid(): boolean {
    this.validateName();
    this.validateNumberOfSections();
    this.sectionComponents.forEach((component) => {
      component.validate();
    });
    return (
      this.nameValidationError == null &&
      this.numberOfSectionsError == null &&
      this.sectionComponents.toArray().every((component) => component.isValid())
    );
  }

  addSection(index: number): void {
    const newSection = {
      name: this.translate.instant(
        'createSurvey.createSurvey.defaultSectionName'
      ),
      visibility: SectionVisibility.ALWAYS,
      questions: [
        {
          content: this.translate.instant(
            'createSurvey.createSurvey.defaultQuestionContent'
          ),
          isRequired: true,
          type: QuestionType.SINGLE_CHOICE,
          options: [],
          imageOptions: [],
          numberRange: {
            from: 0,
            to: 5,
            step: 1,
            sectionVisibilityTrigger: {},
          },
        },
      ],
      displayOnOneScreen: false,
    };
    this.model.sections.splice(index, 0, newSection);
    this.changed.emit();
  }

  addSectionBelow(anotherSection: CreateSectionModel): void {
    const idx = this.model.sections.indexOf(anotherSection);
    if (idx !== -1) {
      this.addSection(idx + 1);
    }
  }

  removeSection(section: CreateSectionModel): void {
    const idx = this.model.sections.indexOf(section);
    if (idx !== -1) {
      this.model.sections.splice(idx, 1);
      this.changed.emit();
    }
  }

  save() {
    if (this.isLocked) {
      return;
    }
    this.isLocked = true;

    if (!this.isValid()) {
      this.isLocked = false;
      this.snackbar.open(
        this.translate.instant(
          'createSurvey.createSurvey.fixValidationErrorsFirst'
        ),
        this.translate.instant('createSurvey.createSurvey.ok'),
        { duration: 3000 }
      );
      return;
    }

    const observable = this.getSaveObservable();

    if (!observable) {
      return;
    }
    observable
      .pipe(
        catchError((error) => {
          this.snackbar.open(
            this.translate.instant(
              'createSurvey.createSurvey.somethingWentWrong'
            ),
            this.translate.instant('createSurvey.createSurvey.ok'),
            { duration: 3000 }
          );
          console.log(error);
          this.isLocked = false;
          return of('');
        })
      )
      .subscribe((res) => {
        if (res === '') {
          return;
        }
        this.isLocked = false;
        this.snackbar.open(
          this.translate.instant(
            this.mode == 'create'
              ? 'createSurvey.createSurvey.successfullyCreatedSurvey'
              : 'createSurvey.createSurvey.successfullyUpdatedSurvey'
          ),
          this.translate.instant('createSurvey.createSurvey.ok'),
          { duration: 3000 }
        );
        console.log(res);
        this.saved.emit();
        if (this.mode == 'create') {
          this.router.navigate([`/surveys/${res.id}`]);
        }
      });
  }

  getSaveObservable(): Observable<any> | undefined {
    const dto = this.surveyMapper.map(this.model);
    if (this.mode == 'create') {
      const files = this.model.sections
        .flatMap((s) =>
          s.questions.flatMap((q) => q.imageOptions.map((io) => io.file))
        )
        .filter((f) => f !== null) as File[];
      return this.service.createSurvey(dto, files);
    }

    if (this.id) {
      const files = this.model.sections
        .flatMap((s) =>
          s.questions.flatMap((q) =>
            q.imageOptions.map((io) =>
              io.file == undefined ? io.src : io.file
            )
          )
        )
        .filter((f) => f !== null) as (File | string)[];
      return this.service.update(dto, files, this.id);
    }

    return undefined;
  }

  sectionDown(section: CreateSectionModel): void {
    const index = this.model.sections.indexOf(section);

    if (index > -1 && index < this.model.sections.length - 1) {
      const temp = this.model.sections[index];
      this.model.sections[index] = this.model.sections[index + 1];
      this.model.sections[index + 1] = temp;
      this.changed.emit();
    }
  }

  sectionUp(section: CreateSectionModel): void {
    const index = this.model.sections.indexOf(section);

    if (index > 0) {
      const temp = this.model.sections[index];
      this.model.sections[index] = this.model.sections[index - 1];
      this.model.sections[index - 1] = temp;
      this.changed.emit();
    }
  }

  async copyToClipboard(): Promise<void> {
    const json = JSON.stringify(this.model);
    await navigator.clipboard.writeText(json);
    this.snackbar.open(
      this.translate.instant('createSurvey.copiedToClipboard'),
      this.translate.instant('createSurvey.ok'),
      { duration: 3000 }
    );
  }

  async paste(): Promise<void> {
    try {
      const clipboardContent = await navigator.clipboard.readText();
      const parsedModel: CreateSurveyModel = JSON.parse(clipboardContent!);
      this.model = parsedModel;
      this.changed.emit();
    } catch (error) {
      this.snackbar.open(
        this.translate.instant('createSurvey.invalidClipboardContent'),
        this.translate.instant('createSurvey.ok'),
        { duration: 3000 }
      );
    }
  }
}
