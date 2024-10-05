import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../../../../core/services/local-storage';
import { STORAGE_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';

interface NavListItem {
  display: string;
  matIcon: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  isDrawerOpen = true;

  navListItems: NavListItem[] = [
    {
      display: 'app.dashboard.respondents',
      matIcon: 'group',
      link: 'respondents'
    },
    {
      display: 'app.dashboard.surveys',
      matIcon: 'content_paste',
      link: 'surveys'
    },
    {
      display: 'app.dashboard.creatingSurveys',
      matIcon: 'build',
      link: 'surveys/new'
    },
    {
      display: 'app.dashboard.results',
      matIcon: 'bar_chart',
      link: 'summaries'
    }
  ]

  readonly langageDisplayMappings: Record<string, string> = {
    ['en']: 'English',
    ['pl']: 'Polski'
  };

  constructor(private translateService: TranslateService,
    @Inject(STORAGE_SERVICE_TOKEN)private readonly storage: LocalStorageService) {}
  ngOnInit(): void {
    this._language = this.translateService.currentLang;
  }

  get availableLanguages(): string[] {
    return this.translateService.getLangs();
  }

  private _language: string = 'en';

  get language(): string {
    return this._language;
  }

  set language(value: string) {
    this._language = value;
    this.translateService.use(value);
    this.storage.save('lang', value);
  }

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}
