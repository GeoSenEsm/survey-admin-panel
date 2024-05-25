import { Component, Input } from '@angular/core';
import { TextSelectionOption } from '../../../../../core/models/text.selection.option';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';

@Component({
  selector: 'app-option',
  standalone: false,
  templateUrl: './option.component.html',
  styleUrl: './option.component.css'
})
export class OptionComponent {
  @Input() option!: TextSelectionOption;
  optionError: string | null = null;
  optionErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.optionError);

  validate() : void {
    this.optionError = null;
    let error: string | null = null;
    if (this.option.content == null || this.option.content.trim().length == 0){
      error = 'Opcja nie może być pusta';
    }
    else if (this.option.content.length > 50){
      error = 'Opcja nie może być dłuzsza niz 50 znaków';
    }

    if (error !== null){
      this.optionError = error;
    }
  }

  isValid() : boolean{
    return this.optionError === null;
  }
}