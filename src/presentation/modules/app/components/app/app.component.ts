import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ENGLISH_DATE_FORMATS, POLISH_DATE_FORMATS } from '../../date.formats';
import { LocalStorageService } from '../../../../../core/services/local-storage';
import { STORAGE_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { getConfiguredLanguage, SUPPORTED_LANGUAGES } from '../../supported-languages';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'survey-admin-panel';

  private readonly _pagesWithoutDashboard: string[] = [
    '/login', '/', ''
  ]
  private readonly langChangeSubscription: Subscription;

  constructor(private readonly _router: Router,
    private readonly translateService: TranslateService,
    @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Inject(MAT_DATE_FORMATS) matDateFormats: any,
    @Inject(STORAGE_SERVICE_TOKEN) storage: LocalStorageService) {
      translateService.addLangs([...SUPPORTED_LANGUAGES]);
      const lang = getConfiguredLanguage(storage.get<string>('lang'), translateService.getBrowserLang());
      translateService.use(lang);

      this.langChangeSubscription = translateService.onLangChange.subscribe((event) => {
        const lang = event.lang;
        if (lang === 'pl'){
          dateLocale = 'pl-PL';
          matDateFormats = POLISH_DATE_FORMATS
        } else if (lang === 'fr'){
          dateLocale = 'fr-FR';
          matDateFormats = ENGLISH_DATE_FORMATS; // Use English format for now, can be customized
        } else if (lang === 'es'){
          dateLocale = 'es-ES';
          matDateFormats = ENGLISH_DATE_FORMATS; // Use English format for now, can be customized
        } else if (lang === 'de'){
          dateLocale = 'de-DE';
          matDateFormats = ENGLISH_DATE_FORMATS; // Use English format for now, can be customized
        } else if (lang === 'zh'){
          dateLocale = 'zh-CN';
          matDateFormats = ENGLISH_DATE_FORMATS; // Use English format for now, can be customized
        } else{
          dateLocale = 'en-US';
          matDateFormats = ENGLISH_DATE_FORMATS;
        }
      });
  }

  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
  }

  shouldDisplayDashboard(): boolean{
    return !this._pagesWithoutDashboard.includes(this._router.url);
  }
}
