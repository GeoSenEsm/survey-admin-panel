import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private readonly _router: Router){
  }

  shouldDisplayDashboard(): boolean{
    return !this._pagesWithoutDashboard.includes(this._router.url);
  }
}