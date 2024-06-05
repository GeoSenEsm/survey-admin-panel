import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CreateSurveySendingPolicyModel } from '../../../../../core/models/create.survey.sending.policy.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Mapper } from '../../../../../core/mappers/mapper';
import { CreateSurveySendingPolicyDto } from '../../../../../domain/models/create.survey.sending.policy.dto';
import { SurveySendingPolicyService } from '../../../../../domain/external_services/survey.sending.policy.service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';

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
  datesErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.datesError);


  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('createSurveySendingPolicyMapper') 
    private readonly mapper: Mapper<CreateSurveySendingPolicyModel, CreateSurveySendingPolicyDto>,
    @Inject('surveySendingPolicyService')private readonly service: SurveySendingPolicyService,
    private readonly dialogRef: MatDialogRef<CreateSurveySendingPolicyComponent>,
    private readonly snackbar: MatSnackBar){
      this.model = {
        surveyId: data.surveyId,
        dates: []
      };
      this.surveyForm = this.fb.group({
    });
  }

  isValid(): boolean {
    this.datesError = null;

    if (this.model.dates.length === 0) {
      this.datesError = "Wybierz co najmniej jedną datę";
    }

    return this.datesError == null;
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
          this.snackbar.open('Coś poszło nie tak', 'OK', { duration: 3000 });
          //TO DO: change to custom error
          return throwError(() => new Error('Error'));
        }),
        finalize(() => {
          this.isBusy = false;
        })
      )
      .subscribe({
        next: _ => {
          this.snackbar.open('Dodano politykę wysyłania ankiety', 'OK', { duration: 3000 });
          this.dialogRef.close();
        },
        error: err => {
          console.error('Error:', err);
        }
      });
  }
}
