import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../../../../core/services/local-storage';
import { STORAGE_SERVICE_TOKEN, TOKEN_HANDLER_TOKEN } from '../../../../../core/services/injection-tokens';
import { TokenHandler } from '../../../../../core/services/token-handler';
import { R } from '@fullcalendar/core/internal-common';
import { Router } from '@angular/router';

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
      display: 'app.dashboard.configuration',
      matIcon: 'settings',
      link: 'configuration'
    },
    {
      display: 'app.dashboard.startSurvey',
      matIcon: "list",
      link: 'startSurvey'
    },
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
    },
    {
      display: 'app.dashboard.temepratureSensors',
      matIcon: 'device_thermostat',
      link: 'temperature'
    },
    {
      display: 'app.dashboard.map',
      matIcon: 'map',
      link: 'map'
    }
  ]

  readonly langageDisplayMappings: Record<string, string> = {
    ['en']: 'English',
    ['pl']: 'Polski'
  };
  avatarInitials: string = 'A';

  constructor(private translateService: TranslateService,
    @Inject(STORAGE_SERVICE_TOKEN) private readonly storage: LocalStorageService,
    @Inject(TOKEN_HANDLER_TOKEN) private readonly tokenHandler: TokenHandler,
    private readonly router: Router) {}
  
    ngOnInit(): void {
    this._language = this.translateService.currentLang;
    this.loadInitials();
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

  private loadInitials(): void{
    const token = this.storage.get<string>('token');

    if (!token) {
      return;
    }

    const username = this.tokenHandler.getClaim(token, 'sub');
    if (typeof username === 'string') {
      this.avatarInitials = username.charAt(0).toUpperCase();
    }
  }

  logout(): void{
    this.storage.remove('token');
    this.router.navigate(['login']);
  }
}
