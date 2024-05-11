import { Component, Input } from '@angular/core';
import { ButtonData } from './button.data';

@Component({
  selector: 'app-buttons-ribbon',
  templateUrl: './buttons.ribbon.component.html',
  styleUrl: './buttons.ribbon.component.css'
})
export class ButtonsRibbonComponent {
  @Input() buttons: ButtonData[] = [];

}
