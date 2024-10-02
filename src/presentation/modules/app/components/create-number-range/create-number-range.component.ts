import { Component, Input } from '@angular/core';
import { NumberRangeModel } from '../../../../../core/models/number.range.model';
import { SectionToBeTriggered } from '../../../../../core/models/section.to.be.triggered';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-number-range',
  templateUrl: './create-number-range.component.html',
  styleUrl: './create-number-range.component.css'
})
export class CreateNumberRangeComponent {
  fromOptions = [0, 1];
  toOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  @Input()
  model!: NumberRangeModel;
  @Input()
  isReadOnly: boolean = false;

  @Input()
  sectionsToBeTriggered: SectionToBeTriggered[] = [];

  constructor(readonly translate: TranslateService){}
}
