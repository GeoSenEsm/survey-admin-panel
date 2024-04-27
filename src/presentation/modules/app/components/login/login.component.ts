import { Component } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';

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
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly maxLength = 250;
  readonly usernameFormControl = new FormControl('', [Validators.required, Validators.maxLength(this.maxLength)]);
  readonly passwordFormControl = new FormControl('', [Validators.required, Validators.maxLength(this.maxLength)]);
  readonly form = new FormGroup([this.usernameFormControl, this.passwordFormControl]);
  readonly matcher = new MyErrorStateMatcher();

  constructor(private readonly router: Router){}

  submit(){
    this.router.navigate(['/']);
  }
}
