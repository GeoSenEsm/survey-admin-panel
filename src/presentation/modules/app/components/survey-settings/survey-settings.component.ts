import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import {
  CSV_COLUMN_SEPARATOR_OPTIONS,
  CSV_DECIMAL_SEPARATOR_OPTIONS,
  DEFAULT_SURVEY_SETTINGS,
  SurveySettings,
} from '../../../../../domain/models/survey-settings';
import { SurveySettingsService } from '../../../../../domain/external_services/survey-settings.service';

@Component({
  selector: 'app-survey-settings',
  templateUrl: './survey-settings.component.html',
  styleUrl: './survey-settings.component.scss',
})
export class SurveySettingsComponent implements OnInit {
  readonly columnSeparatorOptions = CSV_COLUMN_SEPARATOR_OPTIONS;
  readonly decimalSeparatorOptions = CSV_DECIMAL_SEPARATOR_OPTIONS;

  isBusy = false;
  settings: SurveySettings = { ...DEFAULT_SURVEY_SETTINGS };

  constructor(
    @Inject('surveySettingsService')
    private readonly service: SurveySettingsService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.service
      .getSettings()
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (settings) => {
          this.settings = { ...settings };
        },
        error: () => this.showError('surveySettings.loadError'),
      });
  }

  onCalendarToggle(enabled: boolean): void {
    this.save({ ...this.settings, showSendingPolicyCalendar: enabled }, () => {
      this.settings.showSendingPolicyCalendar = !enabled;
    });
  }

  onColumnSeparatorChange(value: string): void {
    if (value === this.settings.csvDecimalSeparator) {
      this.showError('surveySettings.separatorsMustDiffer');
      return;
    }
    this.save({ ...this.settings, csvColumnSeparator: value }, () => {
      /* revert handled via reload of previous value in save error path */
    });
  }

  onDecimalSeparatorChange(value: string): void {
    if (value === this.settings.csvColumnSeparator) {
      this.showError('surveySettings.separatorsMustDiffer');
      return;
    }
    this.save({ ...this.settings, csvDecimalSeparator: value });
  }

  private save(
    payload: SurveySettings,
    onError?: () => void
  ): void {
    if (this.isBusy) {
      onError?.();
      return;
    }

    const previous = { ...this.settings };
    this.settings = { ...payload };
    this.isBusy = true;
    this.service
      .updateSettings(payload)
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (settings) => {
          this.settings = { ...settings };
          this.snackbar.open(
            this.translate.instant('surveySettings.saved'),
            this.translate.instant('surveySettings.ok'),
            { duration: 3000 }
          );
        },
        error: () => {
          this.settings = previous;
          onError?.();
          this.showError('surveySettings.saveError');
        },
      });
  }

  private showError(key: string): void {
    this.snackbar.open(
      this.translate.instant(key),
      this.translate.instant('surveySettings.ok')
    );
  }
}
