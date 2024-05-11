import { Component } from '@angular/core';

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
export class DashboardComponent {
  isDrawerOpen = true;

  navListItems: NavListItem[] = [
    {
      display: 'Respondents',
      matIcon: 'group',
      link: 'respondents'
    },
    {
      display: 'Surveys',
      matIcon: 'content_paste',
      link: 'surveys'
    },
    {
      display: 'Results',
      matIcon: 'bar_chart',
      link: 'results'
    }
  ]

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}
