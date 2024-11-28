import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ImageOption } from '../../../../../core/models/image_option';
import { FormlessErrorStateMatcher } from '../../../../utils/formless.error.state.matcher';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {
  readonly maxCodeLength = 20;
  @Input()
  imageOption: ImageOption | undefined;
  @Input()
  allImageOptions: ImageOption[] | undefined;
  codeError: string | null = null;
  imageError: string | null = null;
  codeErrorStateMatcher = new FormlessErrorStateMatcher(() => this.codeError);
  imageErrorStateMatcher = new FormlessErrorStateMatcher(() => this.imageError);
  @Input()
  isReadOnly: boolean = false;

  constructor() { }


  setFileData(event: Event): void {
    const eventTarget: HTMLInputElement | null = event.target as HTMLInputElement | null;
    if (eventTarget?.files?.[0]) {
      const file: File = eventTarget.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (this.imageOption){
          this.imageOption.file = file;
          this.imageOption.src = reader.result as string;
          this.imageError = null;
        }
      });
      reader.readAsDataURL(file);
    }
  }

  clearFile(): void{
    if (this.imageOption){
      this.imageOption.file = undefined;
      this.imageOption.src = undefined;
    }
  }

  validate(): boolean{
    const codeValid = this.validateCode();
    const imageValid = this.validateImage();
    return codeValid && imageValid;
  }

  validateCode(): boolean{
    this.codeError = null;
    if (!this.imageOption){
      return true;
    }

    if (!this.imageOption.code){
      this.codeError = "createSurvey.createImageOptions.codeRequiredError";
      return false;
    }

    if (!this.allImageOptions){
      return true;
    }

    const isDuplicate = this.allImageOptions.some(
      option => option.code === this.imageOption!.code && option !== this.imageOption
    );

    if (isDuplicate){
      this.codeError = "createSurvey.createImageOptions.codeDuplicateError";
      return false;
    }

    return true;
  }

  validateImage(): boolean{
    this.imageError = null;

    if (!this.imageOption){
      return true;
    }

    if (!this.imageOption.file){
      this.imageError = "createSurvey.createImageOptions.imageRequiredError";
      return false;
    }

    return true;
  }

  remove(): void{
    if (this.allImageOptions && this.imageOption){
      this.allImageOptions.splice(this.allImageOptions.indexOf(this.imageOption), 1);
    }
  }
}
