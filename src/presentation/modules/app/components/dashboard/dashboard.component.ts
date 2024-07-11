import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface NavListItem {
  display: string;
  matIcon: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
    ['pl']: 'polski'
  };

  constructor(private translateService: TranslateService) {}
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
  }

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}
