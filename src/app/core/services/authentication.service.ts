import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { CreateRespondentsAccountsDto } from '../models/create.respondents.accounts.dto';
import { Observable } from 'rxjs';
import { LoginDto } from '../models/login.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService  extends ApiService{

  constructor(client: HttpClient) {
    super(client);
  }

  public generateRespondents(dto: CreateRespondentsAccountsDto): Observable<LoginDto[]>{
    return this.post('/api/authentication/respondents', dto);
  }
}
