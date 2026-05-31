import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateSurveySendingPolicyDto, crossDatesAndTimes } from '../../../../../domain/models/create-survey-sending-policy-dto';
import { SurveySendingPolicyService } from '../../../../../domain/external_services/survey-sending-policy-service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { StringTimeRange } from '../../../../../core/models/time-range';
import { stringTimeRangesOverlapping } from '../../../../../core/utils/time-functions';
import { SurveySendingPolicyDto } from '../../../../../domain/models/survey.sending.policy.dto';
import { parseToTime } from '../../../../../core/utils/parsers';
import { overlap } from '../../../../../domain/models/create-survey-participation-time-slot-dto';
import { HttpErrorResponse } from '@angular/common/http';
import { parseUtcDateTime } from '../../../../../core/utils/utc-date-time';

@Component({
  selector: 'app-create-survey-sending-policy',
  templateUrl: './create-survey-sending-policy.component.html',
  styleUrl: './create-survey-sending-policy.component.css'
})
export class CreateSurveySendingPolicyComponent {
  readonly surveyId: string;
  readonly existingPolicies: SurveySendingPolicyDto[] = [];
  model: CreateSurveySendingPolicyDto | undefined;
  dates: Date[] = [new Date()];
  timeRanges: StringTimeRange[] = [
    {
      from: '7:00',
      to: '11:00'
    }
  ];
  isBusy = false;
  datesError: string | null = null;
  timesError: string | null = null;
  overlapWithExistingError: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('surveySendingPolicyService')private readonly service: SurveySendingPolicyService,
    private readonly dialogRef: MatDialogRef<CreateSurveySendingPolicyComponent>,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService){
      this.surveyId = data.surveyId;
      this.existingPolicies = data.existingPolicies;
  }

  isValid(): boolean {
    this.datesError = null;
    this.timesError =  null;
    this.overlapWithExistingError =  null;

    if (!this.dates || this.dates.length === 0) {
      this.datesError = this.translate.instant('surveyDetails.createSurveySendingPolicy.atLeastOneDateError');
    }

    if (stringTimeRangesOverlapping(this.timeRanges)){
      this.timesError = this.translate.instant('surveyDetails.createSurveySendingPolicy.timesOverlapping');
      return false;
    }

    this.model = crossDatesAndTimes(this.surveyId, this.dates, this.timeRanges.map(e => {
      return {
        from: parseToTime(e.from)!,
        to: parseToTime(e.to)!
      }
    }));

    const existing = this.existingPolicies.map(e => e.timeSlots).flat()
    .filter(e => !e.deleted)
    .map(e => {
      return {
        start: parseUtcDateTime(e.start),
        finish: parseUtcDateTime(e.finish)
      }
    });

    if (overlap(this.model.surveyParticipationTimeSlots.concat(existing))) {
      this.model = undefined;
      this.overlapWithExistingError = this.translate.instant('surveyDetails.createSurveySendingPolicy.overlapWithExisting');
      return false;
    }

    return this.datesError == null && this.timesError == null && this.overlapWithExistingError == null;
  }

  onSubmit(): void {
    if (!this.isValid() || this.isBusy || !this.model) {
      return;
    }

    this.isBusy = true;
    this.service
      .createPolicy(this.model)
      .pipe(
        catchError((error) => {
          const message = this.getCreateErrorMessage(error);
          this.snackbar.open(
            message,
            this.translate.instant('surveyDetails.createSurveySendingPolicy.ok'),
            { duration: 3000 }
          );
          return throwError(() => error);
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

  private getCreateErrorMessage(error: HttpErrorResponse): string {
    if (this.isBackendOverlapValidationError(error)) {
      const message = this.translate.instant('surveyDetails.createSurveySendingPolicy.overlapWithExisting');
      this.overlapWithExistingError = message;
      return message;
    }

    return this.translate.instant('surveyDetails.createSurveySendingPolicy.somethingWentWrong');
  }

  private isBackendOverlapValidationError(error: HttpErrorResponse): boolean {
    if (error.status === 409) {
      return true;
    }

    if (error.status !== 400 && error.status !== 422) {
      return false;
    }

    const errorPayload = JSON.stringify(error.error ?? '').toLowerCase();
    return errorPayload.includes('overlap')
      || errorPayload.includes('intersect')
      || errorPayload.includes('intersection')
      || errorPayload.includes('surveyparticipationtimeslots')
      || errorPayload.includes('time slot');
  }
}
