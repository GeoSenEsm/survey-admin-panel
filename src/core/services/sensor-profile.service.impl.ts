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
      errors: string[];
      goldenVectors?: {
        name: string;
        passed: boolean;
        errors: string[];
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

  putDeviceSecret(
    sensorMacId: string,
    secretName: 'bind_key',
    value: string
  ): Observable<void> {
    return this.put(
      `${this.basePath}/devices/${encodeURIComponent(sensorMacId)}/secrets/${secretName}`,
      { value }
    );
  }

  private toIssues(messages: string[]): SensorProfileValidationIssue[] {
    return messages.map((message) => ({
      path: this.extractJsonPath(message),
      code: '',
      message,
    }));
  }

  private extractJsonPath(message: string): string {
    return message.startsWith('$.') || message === '$'
      ? message.split(' ')[0]
      : '';
  }
}
