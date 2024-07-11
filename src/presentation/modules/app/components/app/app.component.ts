import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'survey-admin-panel';

  private readonly _pagesWithoutDashboard: string[] = [
    '/login'
  ]

  constructor(private readonly _router: Router,
    private readonly translateService: TranslateService){
      translateService.addLangs(['en', 'pl']);
      const browserLang = translateService.getBrowserLang();
      translateService.use(browserLang?.match(/en|pl/) ? browserLang : 'en');
  }

  shouldDisplayDashboard(): boolean{
    return !this._pagesWithoutDashboard.includes(this._router.url);
  }
}