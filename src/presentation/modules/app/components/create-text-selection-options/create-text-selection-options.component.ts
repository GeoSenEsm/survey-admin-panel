import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { TextSelectionOption } from '../../../../../core/models/text.selection.option';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';
import { OptionComponent } from '../option/option.component';

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
  sectionsToBeTriggered: CreateSectionModel[] = [];
  commonOptionsError: string | null = null;

  addNewOption() : void {
    this.options.push({
      content: '',
      sectionVisibilityTrigger: {}
    });
  }

  removeOption(index: number) : void {
    this.options.splice(index, 1);
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
      this.commonOptionsError = "Pytanie musi zawierać opcje";
      return;
    }

    const optionsContentSet = new Set(this.options.map(option => option.content));
    if (optionsContentSet.size !== this.options.length){
      this.commonOptionsError = "Wszystkie opcje muszą być uniklane";
    }
  }
}
