import { Observable } from "rxjs";
import { CreateRespondentsAccountsDto } from "../models/create.respondents.accounts.dto";
import { LoginDto } from "../models/login.dto";

export interface AuthenticationService{
    generateRespondents(dto: CreateRespondentsAccountsDto): Observable<LoginDto[]>;
    login(dto: LoginDto): Observable<string>;
}