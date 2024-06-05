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
      display: 'Respondenci',
      matIcon: 'group',
      link: 'respondents'
    },
    {
      display: 'Ankiety',
      matIcon: 'content_paste',
      link: 'surveys'
    },
    {
      display: 'Tworzenie ankiet',
      matIcon: 'build',
      link: 'surveys/new'
    },
    {
      display: 'Wyniki',
      matIcon: 'bar_chart',
      link: 'summaries'
    }
  ]

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}
