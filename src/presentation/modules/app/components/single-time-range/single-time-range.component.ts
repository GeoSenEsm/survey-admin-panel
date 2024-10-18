import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StringTimeRange } from '../../../../../core/models/time-range';

@Component({
  selector: 'app-single-time-range',
  templateUrl: './single-time-range.component.html',
  styleUrl: './single-time-range.component.scss'
})
export class SingleTimeRangeComponent {
  @Input()
  timeRange: StringTimeRange | undefined;
  @Input()
  canRemove: boolean = true;
  @Output()
  removeCallback: EventEmitter<StringTimeRange> = new EventEmitter<StringTimeRange>();

  remove(): void{
    if (this.timeRange && this.canRemove){
      this.removeCallback.emit(this.timeRange);
    }
  }
}
