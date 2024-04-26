import { Component, OnInit } from '@angular/core';
import { CreateRespondentsAccountsDto } from '../core/models/create.respondents.accounts.dto';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../core/services/authentication.service';
import { LoginDto } from '../core/models/login.dto';
import { Clipboard } from '@angular/cdk/clipboard';

interface FormGroupType{
  amount: FormControl<number | null>
}

@Component({
  selector: 'app-add-respondends',
  standalone: false,
  templateUrl: './add-respondends.component.html',
  styleUrl: './add-respondends.component.css'
})
export class AddRespondendsComponent implements OnInit{
  form: FormGroup<FormGroupType> | null = null;
  accounts: LoginDto[] = [];

  dto: CreateRespondentsAccountsDto = {
    amount: 1
  };

  constructor(private formBuilder: FormBuilder,
    private readonly _service: AuthenticationService,
    private readonly _clipboard: Clipboard){
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      amount: [this.dto.amount, [Validators.required, Validators.min(1), Validators.max(400)]]
    });
  }

  submit(): void{
    if (this.form?.invalid){
      return;
    }
    
    this.accounts.length = 0;
    this._service.generateRespondents(this.dto)
    .subscribe(result =>{
      result.forEach(account =>{
        this.accounts.push(account);
      });
    });
  }

  copyToClipboard(): void{
    const csv = this.getCredentialsCsv();
    this._clipboard.copy(csv);
  }

  getCredentialsCsv(): string{
    const header = Object.keys(this.accounts[0]);
    const rows = this.accounts.map(account =>{
      return Object.values(account).join(',');
    });
    return [header, ...rows].join('\n');
  }
}