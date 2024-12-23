import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../domain/external_services/authentication.service';
import { CreateRespondentsAccountsDto } from '../../domain/models/create.respondents.accounts.dto';
import { LoginDto } from '../../domain/models/login.dto';
import { ConfigService } from './config.service';
import { ChangePasswordDto } from '../../domain/models/change-password-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceImpl  extends ApiService implements AuthenticationService {

  constructor(client: HttpClient, configService: ConfigService) {
    super(client, configService);
  }
  updateRespondentPassword(redpondentId: string, dto: ChangePasswordDto): Observable<any> {
    return this.patch(`/api/authentication/admin/${redpondentId}/password`, dto);
  }
  updateAdminPassword(dto: ChangePasswordDto): Observable<string> {
    return this.patch('/api/authentication/password', dto);
  }

  public generateRespondents(dto: CreateRespondentsAccountsDto): Observable<LoginDto[]>{
    return this.post('/api/authentication/respondents', dto);
  }

  login(dto: LoginDto): Observable<string> {
    return this.post('/api/authentication/login/admin', dto, 'text');
  }
}
