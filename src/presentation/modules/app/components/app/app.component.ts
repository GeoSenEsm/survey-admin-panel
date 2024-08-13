import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter } from 'chart.js';
import { Subscription } from 'rxjs';
import { ENGLISH_DATE_FORMATS, POLISH_DATE_FORMATS } from '../../date.formats';
import { LocalStorageService } from '../../../../../core/services/local.storage';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'survey-admin-panel';

  private readonly _pagesWithoutDashboard: string[] = [
    '/login'
  ]
  private readonly langChangeSubscription: Subscription;

  constructor(private readonly _router: Router,
    private readonly translateService: TranslateService,
    @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Inject(MAT_DATE_FORMATS) matDateFormats: any,
    @Inject('storage') storage: LocalStorageService) {
      translateService.addLangs(['en', 'pl']);
      const lang = storage.get<string>('lang') ?? translateService.getBrowserLang();
      translateService.use(lang?.match(/en|pl/) ? lang : 'en');

      this.langChangeSubscription = translateService.onLangChange.subscribe((event) => {
        const lang = event.lang;
        if (lang === 'pl'){
          dateLocale = 'pl-PL';
          matDateFormats = POLISH_DATE_FORMATS
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