import { Component } from '@angular/core';

interface NavListItem {
  display: string;
  matIcon: string;
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
      matIcon: 'group'
    },
    {
      display: 'Surveys',
      matIcon: 'content_paste'
    },
    {
      display: 'Results',
      matIcon: 'bar_chart'
    }
  ]

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}
