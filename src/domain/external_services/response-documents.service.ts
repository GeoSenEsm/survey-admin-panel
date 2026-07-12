import { Observable } from 'rxjs';
import {
  PagedResponseDocuments,
  SurveyResponseDocument,
  SurveyResponseDocumentFilter,
} from '../models/survey-response-document';

export interface ResponseDocumentsService {
  list(filter: SurveyResponseDocumentFilter): Observable<PagedResponseDocuments>;
  download(participationId: string): Observable<SurveyResponseDocument>;
  exportZip(filter: SurveyResponseDocumentFilter): Observable<Blob>;
}
