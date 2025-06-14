import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, pipe } from 'rxjs';
import { ConfigService } from '../../../../../core/services/config.service';
import { notIn } from '../../../../../core/utils/validators';

export interface CreateNewContactData {
  names: string[];
  numbers: string[];
  createdCallback: () => void;
}

@Component({
  selector: 'app-create-new-contact-phone-number',
  templateUrl: './create-new-contact-phone-number.component.html',
  styleUrl: './create-new-contact-phone-number.component.scss',
})
export class CreateNewContactPhoneNumberComponent {
  readonly maxNameLength = 50;
  readonly maxPhoneNumberLength = 50;
  isBusy = false;

  formGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.maxLength(this.maxNameLength),
      notIn(this.data.names),
    ]),
    number: new FormControl('', [
      Validators.required,
      Validators.maxLength(this.maxPhoneNumberLength),
      Validators.pattern(/^[+]?[0-9]{1,3}[-.\\s]?[0-9]{3,}[-.\\s]?[0-9]{3,}[-.\\s]?[0-9]{2,}[-.\\s]?[0-9]*$/),
      notIn(this.data.numbers),
    ]),
  });

  constructor(
    private readonly matDialogRef: MatDialogRef<CreateNewContactPhoneNumberComponent>,
    private readonly teranslate: TranslateService,
    private readonly httpClient: HttpClient,
    private readonly snackbar: MatSnackBar,
    private readonly configService: ConfigService,
    @Inject(MAT_DIALOG_DATA) private readonly data: CreateNewContactData
  ) {}

  getErrorMessage(controlName: string): string | null {
    const control = this.formGroup.get(controlName);

    if (!control) {
      return null;
    }

    let output = '';
    if (control.hasError('required')) {
      output =
        output +
        ' ' +
        this.teranslate.instant('contactPhoneNumbers.valueIsRequired');
    } else if (control.hasError('maxlength')) {
      const maxLength =
        controlName === 'name' ? this.maxNameLength : this.maxPhoneNumberLength;
      output =
        output +
        ' ' +
        this.teranslate.instant('contactPhoneNumbers.maxLengthError', {
          maxLen: maxLength,
        });
    } else if (control.hasError('pattern')) {
      output =
        output +
        ' ' +
        this.teranslate.instant('contactPhoneNumbers.notValidPhoneNumber');
    }

    if (control.hasError('notIn')) {
      output =
        output +
        ' ' +
        this.teranslate.instant('contactPhoneNumbers.valueMustBeUnique');
    }

    return output;
  }

  cancel(): void {
    this.matDialogRef.close();
  }

  submit(): void {
    if (!this.formGroup.valid || this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.httpClient
      .post(
        this.configService.apiUrl + '/api/phonenumber',
        this.formGroup.value
      )
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: () => {
          const message = this.teranslate.instant(
            'contactPhoneNumbers.successfulyCreatedPhoneNumber'
          );
          this.snackbar.open(
            message,
            this.teranslate.instant('contactPhoneNumbers.ok')
          );
          this.data.createdCallback();
          this.matDialogRef.close();
        },
        error: (error) => {
          console.log(error);
          this.snackbar.open(
            this.teranslate.instant(
              'contactPhoneNumbers.creatingPhoneNumberFailed'
            ),
            this.teranslate.instant('contactPhoneNumbers.ok')
          );
        },
      });
  }
}
