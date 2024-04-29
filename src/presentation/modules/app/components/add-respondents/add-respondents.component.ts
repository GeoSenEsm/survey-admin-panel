import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { AuthenticationServiceImpl } from '../../../../../core/services/authentication.service';
import { LoginDto } from '../../../../../domain/models/login.dto';
import { CreateRespondentsAccountsDto } from '../../../../../domain/models/create.respondents.accounts.dto';

interface FormGroupType{
  amount: FormControl<number | null>
}

@Component({
  selector: 'app-add-respondents',
  standalone: false,
  templateUrl: './add-respondents.component.html',
  styleUrl: './add-respondents.component.css'
})
export class AddRespondentsComponent implements OnInit{
  form: FormGroup<FormGroupType> | null = null;
  accounts: LoginDto[] = [];

  dto: CreateRespondentsAccountsDto = {
    amount: 1
  };

  constructor(private formBuilder: FormBuilder,
    private readonly _service: AuthenticationServiceImpl,
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