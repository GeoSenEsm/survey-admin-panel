import { Component, Input } from '@angular/core';
import { ImageOption } from '../../../../../core/models/image_option';

@Component({
  selector: 'app-create-image-options',
  templateUrl: './create-image-options.component.html',
  styleUrl: './create-image-options.component.scss'
})
export class CreateImageOptionsComponent {
  @Input()
  imageOptions: ImageOption[] | undefined;

  addImageOption() {
    this.imageOptions = this.imageOptions ? [...this.imageOptions, { code: undefined, file: undefined }] : [{ code: '', file: undefined }];
  }
}