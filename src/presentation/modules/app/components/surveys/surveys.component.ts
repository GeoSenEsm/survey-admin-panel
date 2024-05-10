import { Component } from '@angular/core';
import { ButtonData } from '../buttons.ribbon/button.data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrl: './surveys.component.css'
})
export class SurveysComponent {
  ribbonButtons: ButtonData[] = [
    {
      content: 'Add survey',
      onClick: this.createNew.bind(this)
    }
  ]

  constructor(private readonly router: Router){}

  createNew(): void{
    this.router.navigate(['surveys/new']);
  }
}
