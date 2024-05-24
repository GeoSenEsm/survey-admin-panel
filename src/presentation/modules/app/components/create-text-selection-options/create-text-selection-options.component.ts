import { Component, Input } from '@angular/core';
import { TextSelectionOption } from '../../../../../core/models/text.selection.option';
import { CreateSectionModel } from '../../../../../core/models/create.section.model';

@Component({
  selector: 'app-create-text-selection-options',
  templateUrl: './create-text-selection-options.component.html',
  styleUrl: './create-text-selection-options.component.css'
})
export class CreateTextSelectionOptionsComponent {
  @Input()
  options: TextSelectionOption[] = []
  
  @Input()
  sectionsToBeTriggered: CreateSectionModel[] = [];

  addNewOption() : void {
    this.options.push({
      content: '',
      sectionVisibilityTrigger: {}
    });
  }

  removeOption(index: number) : void {
    this.options.splice(index, 1);
  }
}
