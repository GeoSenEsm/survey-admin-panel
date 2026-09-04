import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDocumentsService } from '../../domain/external_services/response-documents.service';
import {
  PagedResponseDocuments,
  SurveyResponseDocument,
  SurveyResponseDocumentFilter,
} from '../../domain/models/survey-response-document';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { toStudyWallClockParam } from '../utils/study-wall-clock';

@Injectable()
export class ResponseDocumentsServiceImpl
  extends ApiService
  implements ResponseDocumentsService {
  constructor(client: HttpClient, configService: ConfigService) {
    super(client, configService);
  }

  list(filter: SurveyResponseDocumentFilter): Observable<PagedResponseDocuments> {
    const params: { [key: string]: string | number } = {
      page: filter.page,
      size: filter.size,
    };
    this.applyFilterParams(params, filter);
    return this.get<PagedResponseDocuments>('/api/surveyresponses/documents', params);
  }

  download(participationId: string): Observable<SurveyResponseDocument> {
    return this.get<SurveyResponseDocument>(
      `/api/surveyresponses/documents/${participationId}/download`
    );
  }

  exportZip(filter: SurveyResponseDocumentFilter): Observable<Blob> {
    const params: { [key: string]: string | number } = {};
    this.applyFilterParams(params, filter);
    return this.getBlob('/api/surveyresponses/documents/export', params);
  }

  private applyFilterParams(
    params: { [key: string]: string | number },
    filter: SurveyResponseDocumentFilter
  ): void {
    if (filter.surveyId) params['surveyId'] = filter.surveyId;
    if (filter.respondentId) params['respondentId'] = filter.respondentId;
    if (filter.dateFrom) params['dateFrom'] = toStudyWallClockParam(filter.dateFrom);
    if (filter.dateTo) params['dateTo'] = toStudyWallClockParam(filter.dateTo);
  }
}
