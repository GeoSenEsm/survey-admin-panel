import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TypeToConfirmDialogComponent } from '../type-to-confirm-dialog/type-to-confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '../../../../../domain/external_services/authentication.service';
import { AUTHENTICATION_SERVICE } from '../../../../../core/services/registration-names';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  readonly minLength = 12;
  formGroup = this.formBuilder.group({
    newPassword: [
      '', 
      [Validators.required, Validators.minLength(this.minLength)]
    ],
    confirmNewPassword: [
      '', 
      [Validators.required, this.passwordMatchValidator.bind(this)]
    ]
  });
  isPasswordVisible = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: RespondentData,
    private readonly formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordComponent>,
    private readonly dialog: MatDialog,
    private readonly translate: TranslateService,
    @Inject(AUTHENTICATION_SERVICE) private readonly service: AuthenticationService,
    private readonly snackbar: MatSnackBar
  ){}

  submit(): void{
    if (this.formGroup.invalid){
      return;
    }

     this.dialog.open(TypeToConfirmDialogComponent, {
          hasBackdrop: true,
          closeOnNavigation: true,
          data:{
            informationText: this.translate.instant('respondents.changePassword.saveConfirmationDialogInformation'),
            textToType: this.translate.instant('respondents.changePassword.saveConfirmationInput')
          }
        })
        .afterClosed()
        .subscribe(res =>{
          if (res === true){
            this.submitCore();
          }
        });
  }

  private submitCore(): void{
    if (this.formGroup.invalid){
      return;
    }
    this.service.updateRespondentPassword(this.data.id,{
      newPassword: this.formGroup.get('newPassword')?.value!
    } ).subscribe({
      next: (res) => {
        this.dialogRef.close(res);
      },
      error: (error) => {
        console.log(error);
        this.snackbar.open(this.translate.instant('respondents.changePassword.somethingWentWrong'), 
        this.translate.instant('respondents.changePassword.ok'), {duration: 3000});
      }
    });
  }

  cancel(): void{
    this.dialogRef.close();
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  passwordMatchValidator(control: AbstractControl) : ValidationErrors | null{
    return control.value === this.formGroup?.get('newPassword')?.value ? null : { 'passwordsDoNotMatch': true };
  }

  getErrorMessage(controlName: string) {
    const control = this.formGroup.get(controlName);

    if (control?.hasError('required')) {
      return this.translate.instant('respondents.changePassword.fieldIsRequired');
    }

    if (control?.hasError('minlength')) {
      return this.translate.instant('respondents.changePassword.passwordMinLenError', { minLen: this.minLength });
    }

    if (control?.hasError('passwordsDoNotMatch')) {
      return this.translate.instant('respondents.changePassword.passwordsDoNotMatch');
    }

    return '';
  }
}
