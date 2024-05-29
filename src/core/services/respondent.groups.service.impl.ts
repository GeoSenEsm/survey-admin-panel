import { Observable } from 'rxjs';
import { RespondentGroupsService } from '../../domain/external_services/respondent.groups.service';
import { RespondentsGroupDto } from '../../domain/models/respondents.group.dto';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class RespondentGroupsServiceImpl
  extends ApiService
  implements RespondentGroupsService {
    
    constructor(client: HttpClient) {
        super(client);
    }
    
    getRespondentsGroups(): Observable<RespondentsGroupDto[]> {
        return this.get('/api/respondentgroups');
    }
  }
