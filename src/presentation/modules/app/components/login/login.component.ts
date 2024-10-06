import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../../domain/external_services/authentication.service';
import { AUTHENTICATION_SERVICE } from '../../../../../core/services/registration-names';
import { STORAGE_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { LocalStorageService } from '../../../../../core/services/local-storage';
import { LoginDto } from '../../../../../domain/models/login.dto';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly maxLength = 250;
  readonly usernameFormControl = new FormControl('', [Validators.required, Validators.maxLength(this.maxLength)]);
  readonly passwordFormControl = new FormControl('', [Validators.required, Validators.maxLength(this.maxLength)]);
  readonly form = new FormGroup([this.usernameFormControl, this.passwordFormControl]);
  readonly matcher = new MyErrorStateMatcher();
  isBusy = false;

  constructor(private readonly router: Router,
    @Inject(AUTHENTICATION_SERVICE) private readonly service: AuthenticationService,
    @Inject(STORAGE_SERVICE_TOKEN) private readonly storage: LocalStorageService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService){}

  submit(){
    if(!this.form.valid || this.isBusy){
      return;
    }

    this.isBusy = true;
    
    this.service.login({
      username: this.usernameFormControl.value!,
      password: this.passwordFormControl.value!
    })
    .pipe(
      catchError(error => {
        if (error.status == 401){
          this.showInvalidCredentials();
        } else {
          this.snackbar.open(this.translate.instant('app.login.somethingWentWrong'), 
            this.translate.instant('createSurvey.createSurvey.ok'), 
        {duration: 3000}
      );
        }
        return throwError(() => error);
      }),
      finalize(() => this.isBusy = false)
    )
    .subscribe({
      next: token => {
        this.storage.save('token', token);
        this.router.navigate(['/']);
      }
    });
  }
  showInvalidCredentials(): void{
    this.usernameFormControl.setErrors({
      invalidUsername: true
    });

    this.passwordFormControl.setErrors({
      invalidPassword: true
    });
  }

  clearInvalidCredentialsErrors(): void{
    this.deleteErrorFromControl('invalidUsername', this.usernameFormControl);
    this.deleteErrorFromControl('invalidPassword', this.passwordFormControl);
  }

  private deleteErrorFromControl(errorToRemove: string, control: AbstractControl<string | null, string | null>): void{
    const errors = control.errors;
    
    if (errors) {
      delete errors[errorToRemove];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }
}
