import { Observable } from "rxjs";
import { CreateRespondentsAccountsDto } from "../models/create.respondents.accounts.dto";
import { LoginDto } from "../models/login.dto";
import { ChangePasswordDto } from "../models/change-password-dto";

export interface AuthenticationService{
    generateRespondents(dto: CreateRespondentsAccountsDto): Observable<LoginDto[]>;
    login(dto: LoginDto): Observable<string>;
    updateAdminPassword(dto: ChangePasswordDto): Observable<string>;
}