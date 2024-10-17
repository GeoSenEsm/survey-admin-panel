import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CreateSurveySendingPolicyModel } from '../../../../../core/models/create.survey.sending.policy.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Mapper } from '../../../../../core/mappers/mapper';
import { CreateSurveySendingPolicyDto } from '../../../../../domain/models/create.survey.sending.policy.dto';
import { SurveySendingPolicyService } from '../../../../../domain/external_services/survey.sending.policy.service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { TranslateService } from '@ngx-translate/core';
import { StringTimeRange } from '../../../../../core/models/time-range';

@Component({
  selector: 'app-create-survey-sending-policy',
  templateUrl: './create-survey-sending-policy.component.html',
  styleUrl: './create-survey-sending-policy.component.css'
})
export class CreateSurveySendingPolicyComponent {
  surveyForm!: FormGroup;
  readonly model: CreateSurveySendingPolicyModel;
  isBusy = false;
  datesError: string | null = null;
  timesError: string | null = null;
  datesErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.datesError);
  timeRanges: StringTimeRange[] = [
    {
      from: '7:00',
      to: '11:00'
    }
  ];

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('createSurveySendingPolicyMapper') 
    private readonly mapper: Mapper<CreateSurveySendingPolicyModel, CreateSurveySendingPolicyDto>,
    @Inject('surveySendingPolicyService')private readonly service: SurveySendingPolicyService,
    private readonly dialogRef: MatDialogRef<CreateSurveySendingPolicyComponent>,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService){
      this.model = {
        surveyId: data.surveyId,
        dates: []
      };
      this.surveyForm = this.fb.group({
    });
  }

  isValid(): boolean {
    this.datesError = null;
    this.timesError =  null;

    if (this.model.dates.length === 0) {
      this.datesError = this.translate.instant('createSurveySendingPolicy.createSurveySendingPolicy.atLeastOneDateError');
    }

    if ()

    return this.datesError == null && this.timesError == null;
  }

  onSubmit(): void {
    if (!this.isValid() || this.isBusy) {
      return;
    }
  
    this.isBusy = true;
    const dto = this.mapper.map(this.model);
    this.service
      .createPolicy(dto)
      .pipe(
        catchError((error) => {
          this.snackbar.open(
            this.translate.instant('surveyDetails.createSurveySendingPolicy.somethingWentWrong'), 
            this.translate.instant('surveyDetails.createSurveySendingPolicy.ok'), 
            { duration: 3000 }
          );
          //TO DO: change to custom error
          return throwError(() => new Error('Error'));
        }),
        finalize(() => {
          this.isBusy = false;
        })
      )
      .subscribe({
        next: newPolicy => {
          this.snackbar.open(
            this.translate.instant('surveyDetails.createSurveySendingPolicy.createdSurveySendingPolicy'), 
            this.translate.instant('surveyDetails.createSurveySendingPolicy.ok'),  
            { duration: 3000 }
          );
          this.dialogRef.close(newPolicy);
        },
        error: err => {
          console.error('Error:', err);
        }
      });
  }
}
