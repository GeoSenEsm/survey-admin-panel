import { Component, Input } from '@angular/core';
import { NumberRangeModel } from '../../../../../core/models/number.range.model';

@Component({
  selector: 'app-create-number-range',
  templateUrl: './create-number-range.component.html',
  styleUrl: './create-number-range.component.css'
})
export class CreateNumberRangeComponent {
  @Input()
  model: NumberRangeModel = {
    from: 0,
    to: 5
  };
}
