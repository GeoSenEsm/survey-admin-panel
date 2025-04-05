import { Component } from '@angular/core';
import { LocationData } from '../../../../../domain/models/location_data';
import { DatePipe } from '@angular/common';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';

@Component({
  selector: 'app-map-pin-tooltip',
  template: `
    <div
      class="container"
      *ngIf="location"
      [ngClass]="location.outsideResearchArea ? 'error-border' : 'black-border'"
    >
      <mat-error *ngIf="location.outsideResearchArea">
        {{ 'map.measurmentOutsideResearchArea' | translate }}
      </mat-error>
      <span>{{
        'map.longitude' | translate : { longitude: location.longitude }
      }}</span>
      <span>{{
        'map.latitude' | translate : { latitude: location.latitude }
      }}</span>
      <span>{{
        'map.dateTime'
          | translate
            : {
                dateTime: getActualDateDisplay()
              }
      }}</span>
      <span>{{
        'map.tooltipRespondent'
          | translate : { respondent: getRespondentName() }
      }}</span>
      <span *ngIf="location.surveyId">{{
        'map.tooltipSurvey' | translate : { survey: getSurveyName() }
      }}</span>
      <span *ngIf="location.accuracyMeters">{{
        'map.tooltipAccuracy' | translate : { accuracy: location.accuracyMeters}
      }}</span>
    </div>
  `,
  styles: `
  .container {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
    border: 2px solid;
    min-width: 150px;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }

  .black-border{
    border-color: black;
  }

  .error-border{
    border-color: red;
  }
  `,
})
export class MapPinTooltipComponent {
  location: LocationData | undefined;
  respondents: RespondentData[] | undefined;
  surveys: SurveySummaryShortDto[] | undefined;

  constructor(readonly datePipe: DatePipe) {}

  getSurveyName(): string | undefined {
    if (this.surveys && this.location) {
      return this.surveys.filter(
        (e) => e.id === this.location!.surveyId
      )[0].name;
    }

    return undefined;
  }

  getRespondentName(): string | undefined {
    console.log(this.location);
    if (this.respondents && this.location) {
      return this.respondents.filter(
        (e) => e.id === this.location!.respondentId
      )[0].username;
    }
    return undefined;
  }

  getActualDateDisplay(): string | undefined | null{
    return this.location?.dateTime ? this.datePipe.transform(new Date(this.location!.dateTime), 'short') : undefined;
  }
}
