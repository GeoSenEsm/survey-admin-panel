import { Component, Input } from '@angular/core';
import { TextSelectionOption } from '../../../../../core/models/text.selection.option';

@Component({
  selector: 'app-create-text-selection-options',
  templateUrl: './create-text-selection-options.component.html',
  styleUrl: './create-text-selection-options.component.css'
})
export class CreateTextSelectionOptionsComponent {
  newOptionContent = '';
  @Input()
  options: TextSelectionOption[] = []

  confirmNewOption(event: KeyboardEvent) : void {
    if (this.newOptionContent === '' || event.key !== 'Enter') {
      return;
    }

    this.options.push({
      content: this.newOptionContent
    });
    this.newOptionContent = '';
  }

  removeOption(index: number) : void {
    this.options.splice(index, 1);
  }
}
