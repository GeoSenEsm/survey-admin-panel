import { Component, Inject } from '@angular/core';
import { TimeUnit } from '../../../../../core/models/time.unit';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CreateSurveySendingPolicyModel } from '../../../../../core/models/create.survey.sending.policy.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-survey-sending-policy',
  templateUrl: './create-survey-sending-policy.component.html',
  styleUrl: './create-survey-sending-policy.component.css'
})
export class CreateSurveySendingPolicyComponent {
  surveyForm!: FormGroup;
  readonly model: CreateSurveySendingPolicyModel;

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
    @Inject(MAT_DIALOG_DATA) public data: any) {
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

  onSubmit() {
    console.log(this.model);
    if (this.surveyForm.valid) {
      console.log(this.model);
    }
  }
}
