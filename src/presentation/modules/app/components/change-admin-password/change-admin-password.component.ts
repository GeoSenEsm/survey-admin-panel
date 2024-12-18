import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../../../../../domain/external_services/authentication.service';
import { AUTHENTICATION_SERVICE } from '../../../../../core/services/registration-names';
import { ChangePasswordDto } from '../../../../../domain/models/change-password-dto';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-admin-password',
  templateUrl: './change-admin-password.component.html',
  styleUrl: './change-admin-password.component.scss',
})
export class ChangeAdminPasswordComponent {
  readonly minLen = 12;
  readonly maxLen = 64;
  formGroup = this.formBuilder.group({
    currentPassword: [
      '',
      [
        Validators.required,
        Validators.maxLength(this.maxLen),
        this.vaidateOldPassword.bind(this),
      ],
    ],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(this.minLen),
        Validators.maxLength(this.maxLen),
      ],
    ],
    confirmNewPassword: ['', [this.passwordMatchValidator.bind(this)]],
  });
  isNewPasswordVisible = false;
  isCurrentPasswordVisible = false;
  isBusy = false;
  isOldPasswordInvalid = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    @Inject(AUTHENTICATION_SERVICE)
    private readonly service: AuthenticationService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {}

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    return control.value === this.formGroup?.get('newPassword')?.value
      ? null
      : { passwordsDoNotMatch: true };
  }

  vaidateOldPassword(_: AbstractControl): ValidationErrors | null {
    return this.isOldPasswordInvalid ? { invalidPassword: true } : null;
  }

  toggleNewPasswordVisibility() {
    this.isNewPasswordVisible = !this.isNewPasswordVisible;
  }

  toggleCurrentPasswordVisibility() {
    this.isCurrentPasswordVisible = !this.isCurrentPasswordVisible;
  }

  getErrorMessage(controlName: string): string {
    const control = this.formGroup.get(controlName);
    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'configuration.changeAdminPassword.fieldIsRequired';
    } else if (control.hasError('minlength')) {
      return 'configuration.changeAdminPassword.minPasswordLen';
    } else if (control.hasError('passwordsDoNotMatch')) {
      return 'configuration.changeAdminPassword.passwordsDontMatch';
    } else if (control.hasError('maxlength')) {
      return 'configuration.changeAdminPassword.maxPasswordLen';
    } else if (control.hasError('invalidPassword')) {
      return 'configuration.changeAdminPassword.invalidPassword';
    }
    return '';
  }

  cancel(): void {
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      control?.setErrors(null);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
    this.formGroup.reset();
  }

  submit(): void {
    if (this.isBusy || this.formGroup.invalid) {
      alert('chujnia');
      return;
    }
    this.isBusy = true;
    const dto: ChangePasswordDto = {
      oldPassword: this.formGroup.get('currentPassword')?.value!,
      newPassword: this.formGroup.get('newPassword')?.value!,
    };
    this.service
      .updateAdminPassword(dto)
      .pipe(
        finalize(() => {
          this.isBusy = false;
        })
      )
      .subscribe({
        next: () => {
          this.cancel();
          this.snackbar.open(
            this.translate.instant(
              'configuration.changeAdminPassword.passwordChangedSuccessfully'
            ),
            this.translate.instant('configuration.ok'),
            {
              duration: 3000,
            }
          );
        },
        error: (error) => {
          let msg = this.translate.instant('configuration.somethingWentWrong');
          if (
            error.status === 400 ||
            error.status == 401 ||
            error.status == 403
          ) {
            this.showInvalidOldPassword();
            msg = this.translate.instant(
              'configuration.changeAdminPassword.invalidPassword'
            );
          }
          this.snackbar.open(msg, this.translate.instant('configuration.ok'), {
            duration: 3000,
          });
        },
      });
  }

  private showInvalidOldPassword() {
    try {
      this.isOldPasswordInvalid = true;
      this.formGroup.updateValueAndValidity();
    } finally {
      this.isOldPasswordInvalid = false;
    }
  }
}
