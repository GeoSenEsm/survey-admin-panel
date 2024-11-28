import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { TextSelectionOption } from '../../../../../core/models/text.selection.option';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { OptionComponent } from '../option/option.component';
import { SectionToBeTriggered } from '../../../../../core/models/section.to.be.triggered';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-text-selection-options',
  templateUrl: './create-text-selection-options.component.html',
  styleUrl: './create-text-selection-options.component.css'
})
export class CreateTextSelectionOptionsComponent {
  @ViewChildren(OptionComponent) optionComponents!: QueryList<OptionComponent>;
  @Input()
  options: TextSelectionOption[] = []
  @Input()
  sectionsToBeTriggered: SectionToBeTriggered[] = [];
  commonOptionsError: string | null = null;
  @Input()
  isReadOnly: boolean = false;
  @Output() changed = new EventEmitter<void>();

  constructor(private readonly translate: TranslateService){}

  addNewOption() : void {
    this.options.push({
      content: ''
    });
    this.changed.emit();
  }

  removeOption(index: number) : void {
    this.options.splice(index, 1);
    this.changed.emit();
  }

  isValid() : boolean {
    return this.commonOptionsError === null &&
    this.optionComponents.toArray().every(option => option.isValid());
  }

  validate() : void {
    this.validateUniquness();
    this.optionComponents.forEach((option) =>{
     option.validate();
    });
  }

  validateUniquness() : void{
    this.commonOptionsError = null;


    if (this.options.length == 0){
      this.commonOptionsError = this.translate.instant("createSurvey.createTextSelectionOptions.questionMustContainOptions");
      return;
    }

    const optionsContentSet = new Set(this.options.map(option => option.content));
    if (optionsContentSet.size !== this.options.length){
      this.commonOptionsError = this.translate.instant("createSurvey.createTextSelectionOptions.optionsMustBeUnique");
    }
  }
}
