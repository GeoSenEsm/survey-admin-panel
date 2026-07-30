import { Component, Input } from '@angular/core';
import {
  RespondentFilters,
  SurveyWindowPresenceFilter,
} from '../../../../../domain/models/respondent-data';

@Component({
  selector: 'app-respondents-filters',
  templateUrl: './respondents-filters.component.html',
  styleUrl: './respondents-filters.component.scss',
})
export class RespondentsFiltersComponent {
  @Input()
  filtersModel: RespondentFilters | undefined;

  readonly surveyWindowPresence = SurveyWindowPresenceFilter;
}
