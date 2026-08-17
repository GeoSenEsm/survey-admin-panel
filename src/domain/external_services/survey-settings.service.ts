import { Observable } from 'rxjs';
import {
  CreateSensorParameterDefinitionRequest,
  EditSensorParameterDefinitionRequest,
  SensorParameterDefinition,
  SurveySensorDataSettings,
  SurveySensorDataSettingsWrite,
  SurveySettings,
} from '../models/survey-settings';

export interface SurveySettingsService {
  getSettings(): Observable<SurveySettings>;
  updateSettings(settings: SurveySettings): Observable<SurveySettings>;
  uploadLogo(file: File): Observable<SurveySettings>;
  deleteLogo(): Observable<SurveySettings>;
  getSensorDataSettings(): Observable<SurveySensorDataSettings>;
  updateSensorDataSettings(
    settings: SurveySensorDataSettingsWrite
  ): Observable<SurveySensorDataSettings>;
  createSensorParameterDefinition(
    request: CreateSensorParameterDefinitionRequest
  ): Observable<SensorParameterDefinition>;
  updateSensorParameterDefinition(
    id: string,
    request: EditSensorParameterDefinitionRequest
  ): Observable<SensorParameterDefinition>;
  /**
   * Hard-deletes a used parameter. There is no soft-hide flag: a parameter is either on the list
   * or removed. Rejected with 409 if sensor readings already exist for it.
   */
  deleteSensorParameterDefinition(id: string): Observable<void>;
  readonly cachedSettings: SurveySettings;
  watchSettings(): Observable<SurveySettings>;
}
