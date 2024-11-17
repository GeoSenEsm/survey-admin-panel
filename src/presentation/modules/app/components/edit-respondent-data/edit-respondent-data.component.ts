import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { START_SURVEY_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { StartSurveyService } from '../../../../../domain/external_services/start-survey.service';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import {
  StartSurveyQuestion,
  StartSurveyResponse,
} from '../../../../../core/models/start-survey-question';
import { catchError, of, throwError } from 'rxjs';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-respondent-data',
  templateUrl: './edit-respondent-data.component.html',
  styleUrl: './edit-respondent-data.component.scss',
})
export class EditRespondentDataComponent implements OnInit {
  questions: StartSurveyQuestion[] = [];
  formGroup = this.formBuilder.group({});

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RespondentData,
    @Inject(START_SURVEY_SERVICE_TOKEN)
    private readonly initialSurveyService: StartSurveyService,
    private readonly formBuilder: FormBuilder,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    private dialogRef: MatDialogRef<EditRespondentDataComponent>
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  private loadQuestions(): void {
    this.clear();

    this.initialSurveyService
      .getStartSurveyQuestions()
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return of([]);
          }
          return throwError(() => error);
        })
      )
      .subscribe((questions) => {
        questions.forEach((question) => {
          this.questions.push(question);
          const givenResponseId = this.data[question.content]
            ? question.options.find((o) => o.id == this.data[question.content])
                ?.id
            : undefined;
          this.formGroup.addControl(
            question.id!,
            this.formBuilder.control(givenResponseId, Validators.required)
          );
        });
      });
  }

  private clear(): void {
    this.questions.length = 0;
    this.formGroup = this.formBuilder.group({});
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const responses = Object.entries(this.formGroup.controls).map(
      ([controlName, control]) => {
        return {
          questionId: controlName,
          optionId: (control as any).value as string,
        };
      }
    );

    this.initialSurveyService.update(this.data.id, responses).subscribe({
      next: () => {
        responses.forEach((response) => {
          const question = this.questions.find((q) => q.id == response.questionId);
          if (question){
            this.data[question.content] = response.optionId;
          } 
        });
        this.dialogRef.close();
      },
      error: (error) => {
        console.log(error);
        this.snackbar.open(
          this.translate.instant('respondents.edit.somethingWentWrong'),
          this.translate.instant('respondents.edit.ok'),
          { duration: 3000 }
        );
      },
    });
  }

  cancel(): void{
    this.dialogRef.close();
  }
}
