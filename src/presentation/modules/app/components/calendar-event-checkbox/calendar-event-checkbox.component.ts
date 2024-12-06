import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-event-checkbox',
  template: `
    <mat-checkbox 
      [checked]="selected"
      (change)="onCheckboxChange($event)">
    </mat-checkbox>
  `,
  styles: [
    `
      mat-checkbox {
        margin-right: 8px;
      }
    `
  ]
})
export class CalendarEventCheckboxComponent {
  @Input() selected: boolean = false;
  @Output() selectionChange = new EventEmitter<boolean>();

  onCheckboxChange(event: any) {
    this.selectionChange.emit(event.checked);
  }
}