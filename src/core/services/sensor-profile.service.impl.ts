import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SensorProfileService } from '../../domain/external_services/sensor-profile.service';
import {
  CreateSensorProfileTypeRequest,
  CreateSensorTypeParameterRequest,
  EditSensorTypeParameterRequest,
  SensorProfileCapabilities,
  SensorProfileDraftRequest,
  SensorProfileGoldenVectorResult,
  SensorProfileRevision,
  SensorProfileValidationIssue,
  SensorProfileSensorType,
  SensorProfileTemplate,
  SensorProfileValidationResult,
  SensorTypeParameter,
  UseSensorTypeParameterRequest,
} from '../../domain/models/sensor-profile';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class SensorProfileServiceImpl
  extends ApiService
  implements SensorProfileService
{
  private readonly basePath = '/api/sensorprofiles';

  constructor(httpClient: HttpClient, configService: ConfigService) {
    super(httpClient, configService);
  }

  getCapabilities(): Observable<SensorProfileCapabilities> {
    return this.get(`${this.basePath}/capabilities`);
  }

  listSensorTypes(): Observable<SensorProfileSensorType[]> {
    return this.get(`${this.basePath}/sensortypes`);
  }

  createSensorType(
    request: CreateSensorProfileTypeRequest
  ): Observable<SensorProfileSensorType> {
    return this.post(`${this.basePath}/types`, request);
  }

  deleteSensorType(sensorTypeId: string): Observable<void> {
    return this.delete(`${this.basePath}/types/${encodeURIComponent(sensorTypeId)}`);
  }

  listSensorTypeParameters(sensorTypeId: string): Observable<SensorTypeParameter[]> {
    return this.get(`${this.basePath}/types/${encodeURIComponent(sensorTypeId)}/parameters`);
  }

  createSensorTypeParameter(
    sensorTypeId: string,
    request: CreateSensorTypeParameterRequest
  ): Observable<SensorTypeParameter> {
    return this.post(
      `${this.basePath}/types/${encodeURIComponent(sensorTypeId)}/parameters`,
      request
    );
  }

  updateSensorTypeParameter(
    sensorTypeId: string,
    id: string,
    request: EditSensorTypeParameterRequest
  ): Observable<SensorTypeParameter> {
    return this.put(
      `${this.basePath}/types/${encodeURIComponent(sensorTypeId)}/parameters/${encodeURIComponent(id)}`,
      request
    );
  }

  deleteSensorTypeParameter(sensorTypeId: string, id: string): Observable<void> {
    return this.delete(
      `${this.basePath}/types/${encodeURIComponent(sensorTypeId)}/parameters/${encodeURIComponent(id)}`
    );
  }

  useSensorTypeParameter(
    sensorTypeId: string,
    id: string,
    request: UseSensorTypeParameterRequest
  ): Observable<SensorTypeParameter> {
    return this.post(
      `${this.basePath}/types/${encodeURIComponent(sensorTypeId)}/parameters/${encodeURIComponent(id)}/use`,
      request
    );
  }

  unuseSensorTypeParameter(sensorTypeId: string, id: string): Observable<SensorTypeParameter> {
    return this.post(
      `${this.basePath}/types/${encodeURIComponent(sensorTypeId)}/parameters/${encodeURIComponent(id)}/unuse`,
      {}
    );
  }

  listTemplates(): Observable<SensorProfileTemplate[]> {
    return this.get(`${this.basePath}/templates`);
  }

  installTemplate(templateCode: string): Observable<SensorProfileSensorType> {
    return this.post(
      `${this.basePath}/templates/${encodeURIComponent(templateCode)}/install`,
      {}
    );
  }

  listRevisions(sensorTypeId: string): Observable<SensorProfileRevision[]> {
    return this.get(`${this.basePath}`, { sensorTypeId });
  }

  getRevision(profileId: string): Observable<SensorProfileRevision> {
    return this.get(`${this.basePath}/${encodeURIComponent(profileId)}`);
  }

  createDraft(
    sensorTypeId: string,
    request: SensorProfileDraftRequest
  ): Observable<SensorProfileRevision> {
    return this.post(
      `${this.basePath}/${encodeURIComponent(sensorTypeId)}/drafts`,
      request
    );
  }

  updateDraft(
    profileId: string,
    request: SensorProfileDraftRequest
  ): Observable<SensorProfileRevision> {
    return this.put(`${this.basePath}/${encodeURIComponent(profileId)}`, request);
  }

  validateDraft(profileId: string): Observable<SensorProfileValidationResult> {
    return this.post<{
      valid: boolean;
      canonicalHash?: string;
      errors: RawValidationIssue[];
      goldenVectors?: {
        name: string;
        passed: boolean;
        errors: RawValidationIssue[];
        decodedValues: Record<string, number>;
      }[];
    }>(
      `${this.basePath}/${encodeURIComponent(profileId)}/validate`,
      {}
    ).pipe(
      map((result) => ({
        valid: result.valid,
        canonicalHash: result.canonicalHash,
        errors: this.toIssues(result.errors ?? []),
        goldenVectors: (result.goldenVectors ?? []).map(
          (golden): SensorProfileGoldenVectorResult => ({
            name: golden.name,
            passed: golden.passed,
            errors: this.toIssues(golden.errors ?? []),
            decodedValues: golden.decodedValues ?? {},
          })
        ),
      }))
    );
  }

  publish(profileId: string): Observable<SensorProfileRevision> {
    return this.post(
      `${this.basePath}/${encodeURIComponent(profileId)}/publish`,
      {}
    );
  }

  rollback(
    sensorTypeId: string,
    revision: number
  ): Observable<SensorProfileRevision> {
    return this.post(
      `${this.basePath}/${encodeURIComponent(sensorTypeId)}/rollback/${revision}`,
      {}
    );
  }

  private toIssues(issues: RawValidationIssue[]): SensorProfileValidationIssue[] {
    return issues.map((issue) => this.toIssue(issue));
  }

  private toIssue(issue: RawValidationIssue): SensorProfileValidationIssue {
    if (typeof issue === 'string') {
      return {
        path: this.extractJsonPath(issue),
        code: '',
        message: issue,
      };
    }
    return {
      path: issue.path ?? '',
      code: issue.code ?? '',
      message: issue.message ?? '',
    };
  }

  private extractJsonPath(message: string): string {
    return message.startsWith('$.') || message === '$'
      ? message.split(' ')[0]
      : '';
  }
}

/**
 * The backend currently reports validation issues as plain strings formatted
 * `"$.some.path free text"` (see `GattProfileValidator`). Accepting a structured shape too
 * keeps this client from breaking outright if that ever changes to a `{path, code, message}`
 * object without a corresponding admin-panel release.
 */
type RawValidationIssue =
  | string
  | { path?: string; code?: string; message?: string };
