import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PhoneNumberDto } from '../contact-phone-numbers/contact-phone-numbers.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { notIn } from '../../../../../core/utils/validators';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../../core/services/config.service';
import { finalize, pipe } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface EditContactData {
  existingContacts: PhoneNumberDto[];
  editedContact: PhoneNumberDto;
}

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrl: './edit-contact.component.scss',
})
export class EditContactComponent {
  readonly maxNameLength = 50;
  readonly maxPhoneNumberLength = 50;
  readonly formGroup: FormGroup;
  readonly existingNames: string[];
  readonly existingNumbers: string[];
  isBusy = false;
  readonly editedContact: PhoneNumberDto;

  constructor(
    private readonly teranslate: TranslateService,
    @Inject(MAT_DIALOG_DATA) data: EditContactData,
    private readonly dialog: MatDialogRef<EditContactComponent>,
    private readonly httpClient: HttpClient,
    private readonly config: ConfigService,
    private readonly snackbar: MatSnackBar
  ) {
    this.existingNames = data.existingContacts.map((item) => item.name);
    this.existingNumbers = data.existingContacts.map((item) => item.number);
    this.formGroup = new FormGroup({
      name: new FormControl(data.editedContact.name, [
        Validators.required,
        Validators.maxLength(this.maxNameLength),
        notIn(this.existingNames),
      ]),
      number: new FormControl(data.editedContact.number, [
        Validators.required,
        Validators.maxLength(this.maxPhoneNumberLength),
        Validators.pattern(/^[+]?[0-9]{1,3}[-.\\s]?[0-9]{3,}[-.\\s]?[0-9]{3,}[-.\\s]?[0-9]{2,}[-.\\s]?[0-9]*$/),
        notIn(this.existingNumbers),
      ]),
    });
    this.editedContact = data.editedContact;
  }

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

  submit(): void {
    if (!this.formGroup.valid || this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.httpClient
      .put(
        `${this.config.apiUrl}/api/phonenumber/${this.editedContact.id}`,
        this.formGroup.value
      )
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: () => {
          const message = this.teranslate.instant(
            'contactPhoneNumbers.editedSuccessfuly'
          );
          this.snackbar.open(
            message,
            this.teranslate.instant('contactPhoneNumbers.ok'),
            {
              duration: 3000,
            }
          );
          this.editedContact.name = this.formGroup.value.name;
          this.editedContact.number = this.formGroup.value.number;
          this.dialog.close();
        },
        error: () => {
          const message = this.teranslate.instant(
            'contactPhoneNumbers.editingFailed'
          );
          this.snackbar.open(
            message,
            this.teranslate.instant('contactPhoneNumbers.ok'),
            {
              duration: 3000,
            }
          );
        },
      });
  }

  cancel(): void {
    this.dialog.close();
  }
}
