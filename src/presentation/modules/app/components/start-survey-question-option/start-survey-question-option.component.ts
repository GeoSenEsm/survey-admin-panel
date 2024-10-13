import { Component, ElementRef, EventEmitter, input, Input, Output, ViewChild } from '@angular/core';
import { StartSurveyOption } from '../../../../../core/models/start-survey-question';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-start-survey-question-option',
  templateUrl: './start-survey-question-option.component.html',
  styleUrl: './start-survey-question-option.component.scss'
})
export class StartSurveyQuestionOptionComponent {
  @Input() option: StartSurveyOption | undefined;
  @Input() allOptions: StartSurveyOption[] | undefined;
  @Input() isReadOnly: boolean = false;
  maxLen: number = 250;
  optionError: string | null = null;
  optionErrorStateMatcher: ErrorStateMatcher = new FormlessErrorStateMatcher(() => this.optionError);
  @Output() removeOptionCallback = new EventEmitter<StartSurveyOption>();

  constructor(private readonly translate: TranslateService){}

  validateOption(): boolean {
    if (!this.option || this.isReadOnly){
      return true;
    }

    this.optionError = null;
    if (this.option.content.trim().length == 0){
      this.optionError = this.translate.instant('startSurvey.optionCannotBeEmpty');
      return false;
    }

    if (this.allOptions && this.allOptions.find(e => e != this.option && e.content.trim() == this.option!.content.trim())){
      this.optionError = this.translate.instant('startSurvey.optionAlreadyExists');
      return false;
    }

    return true;
  }

  removeOption(): void{
    if (this.option){
      this.removeOptionCallback.emit(this.option);
    }
  }
}
