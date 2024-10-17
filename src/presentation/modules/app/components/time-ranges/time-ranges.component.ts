import { Component, Input } from '@angular/core';
import { StringTimeRange } from '../../../../../core/models/time-range';

@Component({
  selector: 'app-time-ranges',
  templateUrl: './time-ranges.component.html',
  styleUrl: './time-ranges.component.scss'
})
export class TimeRangesComponent {
  @Input()
  timeRanges: StringTimeRange[] | undefined;
  @Input()
  error: string | null | undefined;
  get canRemoveRange(): boolean{
    if (this.timeRanges){
      return this.timeRanges.length > 1;
    }
    return false;
  }

  remove(timeRange: StringTimeRange): void{
    if (this.timeRanges){
      this.timeRanges = this.timeRanges.filter(e => e !== timeRange);
    }
  }

  addTimeRange(): void{
     if (this.timeRanges){
      this.timeRanges.push({
        from: '7:00',
        to: '11:00'
      });
     }
  }
}
