import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextSelectionOption } from '../../../../../core/models/text.selection.option';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';

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
  readonly maxLen: number = 150;
  @Input()
  isReadOnly: boolean = false;
  @Output() changed = new EventEmitter<void>();
  @Output() removeOptionCallback = new EventEmitter<TextSelectionOption>();

  constructor(private readonly translate: TranslateService){}

  validate() : void {
    this.optionError = null;
    let error: string | null = null;
    if (this.option.content == null || this.option.content.trim().length == 0){
      error = this.translate.instant('createSurvey.option.notEmptyError');
    }
    else if (this.option.content.length > this.maxLen){
      error = this.translate.instant('createSurvey.option.lenError', {maxLen: this.maxLen});
    }

    if (error !== null){
      this.optionError = error;
    }
  }

  isValid() : boolean{
    return this.optionError === null;
  }

  removeOption(): void{
    this.removeOptionCallback.emit(this.option);
  }
}