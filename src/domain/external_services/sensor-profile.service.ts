import { Observable } from 'rxjs';
import {
  CreateSensorProfileTypeRequest,
  SensorProfileDraftRequest,
  SensorProfileRevision,
  SensorProfileCapabilities,
  SensorProfileSensorType,
  SensorProfileValidationResult,
} from '../models/sensor-profile';

export interface SensorProfileService {
  getCapabilities(): Observable<SensorProfileCapabilities>;
  listSensorTypes(): Observable<SensorProfileSensorType[]>;
  createSensorType(
    request: CreateSensorProfileTypeRequest
  ): Observable<SensorProfileSensorType>;
  listRevisions(sensorTypeId: string): Observable<SensorProfileRevision[]>;
  getRevision(profileId: string): Observable<SensorProfileRevision>;
  createDraft(
    sensorTypeId: string,
    request: SensorProfileDraftRequest
  ): Observable<SensorProfileRevision>;
  updateDraft(
    profileId: string,
    request: SensorProfileDraftRequest
  ): Observable<SensorProfileRevision>;
  validateDraft(profileId: string): Observable<SensorProfileValidationResult>;
  publish(profileId: string): Observable<SensorProfileRevision>;
  rollback(
    sensorTypeId: string,
    revision: number
  ): Observable<SensorProfileRevision>;
  putDeviceSecret(
    sensorMacId: string,
    secretName: 'bind_key',
    value: string
  ): Observable<void>;
}
