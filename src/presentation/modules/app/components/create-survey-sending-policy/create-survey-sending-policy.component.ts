import { Component, Inject } from '@angular/core';
import { TimeUnit } from '../../../../../core/models/time.unit';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CreateSurveySendingPolicyModel } from '../../../../../core/models/create.survey.sending.policy.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Mapper } from '../../../../../core/mappers/mapper';
import { CreateSurveySendingPolicyDto } from '../../../../../domain/models/create.survey.sending.policy.dto';
import { SurveySendingPolicyService } from '../../../../../domain/external_services/survey.sending.policy.service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-survey-sending-policy',
  templateUrl: './create-survey-sending-policy.component.html',
  styleUrl: './create-survey-sending-policy.component.css'
})
export class CreateSurveySendingPolicyComponent {
  surveyForm!: FormGroup;
  readonly model: CreateSurveySendingPolicyModel;
  isBusy = false;

  get allTimeUnits() : TimeUnit[]{
    return [
      TimeUnit.Day,
      TimeUnit.Week
    ];
  }

  get timeUnitsDisplaySelector(){
    return {
      [TimeUnit.Day]: 'Dni',
      [TimeUnit.Week]: 'Tygodnie'
    };
  }

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('createSurveySendingPolicyMapper') 
    private readonly mapper: Mapper<CreateSurveySendingPolicyModel, CreateSurveySendingPolicyDto>,
    @Inject('surveySendingPolicyService')private readonly service: SurveySendingPolicyService,
    private readonly dialogRef: MatDialogRef<CreateSurveySendingPolicyComponent>,
    private readonly snackbar: MatSnackBar){
      this.model = {
        surveyId: data.surveyId
      };
      this.surveyForm = this.fb.group({
      start: [this.model.start, Validators.required],
      end: [this.model.end, Validators.required],
      repeatInterval: [this.model.repeatInterval, [Validators.required, 
        Validators.min(1),
        Validators.max(10)
      ]],
      repeatUnit: [this.model.repeatUnit, Validators.required]
    }, { validators: this.dateLessThan('start', 'end') });
  }

  dateLessThan(startKey: string, endKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get(startKey)?.value;
      const end = group.get(endKey)?.value;
      if (start && end && start >= end) {
        return { dateLessThan: true };
      }
      return null;
    };
  }

  onSubmit(): void {
    if (!this.surveyForm.valid || this.isBusy) {
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
