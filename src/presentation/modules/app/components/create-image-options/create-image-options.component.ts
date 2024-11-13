import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { ImageOption } from '../../../../../core/models/image_option';
import { ImageUploadComponent } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-create-image-options',
  templateUrl: './create-image-options.component.html',
  styleUrl: './create-image-options.component.scss'
})
export class CreateImageOptionsComponent {
  @Input()
  imageOptions: ImageOption[] | undefined;
  @ViewChildren(ImageUploadComponent) optionComponents!: QueryList<ImageUploadComponent>;

  addImageOption() {
    this.imageOptions = this.imageOptions ? [...this.imageOptions, { code: undefined, file: undefined }] : [{ code: '', file: undefined }];
  }

  validate(): boolean{
    let valid = true;
    this.optionComponents.toArray().forEach(option => {
      const innerValid = option.validate();
      if (!innerValid)
      {
        valid = false;
      }
    });
    return valid;
  }
}