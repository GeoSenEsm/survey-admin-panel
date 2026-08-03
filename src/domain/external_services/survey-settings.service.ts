import { Observable } from 'rxjs';
import {
  RespondentSensorAssignment,
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
  /**
   * Always available, even once `updateSensorDataSettings` starts rejecting changes: respondent
   * sensor assignments keep changing throughout a live study.
   */
  updateAssignments(
    assignments: RespondentSensorAssignment[]
  ): Observable<SurveySensorDataSettings>;
  readonly cachedSettings: SurveySettings;
  watchSettings(): Observable<SurveySettings>;
}
