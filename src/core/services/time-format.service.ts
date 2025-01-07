import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxMatTimepickerFormatType } from 'ngx-mat-timepicker';

@Injectable({
  providedIn: 'root',
})
export class TimeFormatService {
  format: NgxMatTimepickerFormatType = 12;

  constructor(translate: TranslateService) {
    this.format = this.formatFromLocale(translate.currentLang);
    translate.onLangChange.subscribe(
      () => (this.format = this.formatFromLocale(translate.currentLang))
    );
  }

  formatFromLocale(locale: string): NgxMatTimepickerFormatType {
    return locale === 'pl' ? 24 : 12;
  }
}
