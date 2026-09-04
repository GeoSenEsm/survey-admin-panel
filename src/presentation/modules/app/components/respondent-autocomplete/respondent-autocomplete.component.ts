import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { RespondentData } from '../../../../../domain/models/respondent-data';

@Component({
  selector: 'app-respondent-autocomplete',
  templateUrl: './respondent-autocomplete.component.html',
  styleUrl: './respondent-autocomplete.component.scss',
})
export class RespondentAutocompleteComponent implements OnInit {
  @Input({ required: true }) control!: FormControl<RespondentData | string | null>;

  /** Emits the loaded list once, so the host can resolve the control's value to an id itself. */
  @Output() respondentsLoaded = new EventEmitter<RespondentData[]>();

  respondents: RespondentData[] = [];
  filteredRespondents: RespondentData[] = [];
  loading = false;

  constructor(
    @Inject('respondentDataService')
    private readonly respondentDataService: RespondentDataService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.respondentDataService
      .getRespondents(undefined)
      .pipe(
        catchError(() => of([] as RespondentData[])),
        finalize(() => (this.loading = false))
      )
      .subscribe((respondents) => {
        this.respondents = respondents;
        this.filteredRespondents = respondents;
        this.respondentsLoaded.emit(respondents);
      });
  }

  displayRespondent = (value: RespondentData | string | null): string => {
    if (!value) {
      return '';
    }
    return typeof value === 'string' ? value : value.username ?? '';
  };

  onInput(event: Event): void {
    const needle = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredRespondents = needle
      ? this.respondents.filter((r) => String(r.username).toLowerCase().includes(needle))
      : this.respondents.slice();
  }

  clear(): void {
    this.control.setValue(null);
    this.filteredRespondents = this.respondents.slice();
  }
}
