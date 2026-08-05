import { Observable } from 'rxjs';
import {
  CreateSensorProfileTypeRequest,
  CreateSensorTypeParameterRequest,
  EditSensorTypeParameterRequest,
  SensorProfileDraftRequest,
  SensorProfileRevision,
  SensorProfileCapabilities,
  SensorProfileSensorType,
  SensorProfileTemplate,
  SensorProfileValidationResult,
  SensorTypeParameter,
  UseSensorTypeParameterRequest,
} from '../models/sensor-profile';

export interface SensorProfileService {
  getCapabilities(): Observable<SensorProfileCapabilities>;
  listSensorTypes(): Observable<SensorProfileSensorType[]>;
  createSensorType(
    request: CreateSensorProfileTypeRequest
  ): Observable<SensorProfileSensorType>;
  deleteSensorType(sensorTypeId: string): Observable<void>;
  listSensorTypeParameters(sensorTypeId: string): Observable<SensorTypeParameter[]>;
  createSensorTypeParameter(
    sensorTypeId: string,
    request: CreateSensorTypeParameterRequest
  ): Observable<SensorTypeParameter>;
  updateSensorTypeParameter(
    sensorTypeId: string,
    id: string,
    request: EditSensorTypeParameterRequest
  ): Observable<SensorTypeParameter>;
  deleteSensorTypeParameter(sensorTypeId: string, id: string): Observable<void>;
  useSensorTypeParameter(
    sensorTypeId: string,
    id: string,
    request: UseSensorTypeParameterRequest
  ): Observable<SensorTypeParameter>;
  unuseSensorTypeParameter(sensorTypeId: string, id: string): Observable<SensorTypeParameter>;
  listTemplates(): Observable<SensorProfileTemplate[]>;
  installTemplate(templateCode: string): Observable<SensorProfileSensorType>;
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
