import { Observable } from 'rxjs';
import {
  SurveySensorDataSettings,
  SurveySettings,
} from '../models/survey-settings';

export interface SurveySettingsService {
  getSettings(): Observable<SurveySettings>;
  updateSettings(settings: SurveySettings): Observable<SurveySettings>;
  uploadLogo(file: File): Observable<SurveySettings>;
  deleteLogo(): Observable<SurveySettings>;
  getSensorDataSettings(): Observable<SurveySensorDataSettings>;
  updateSensorDataSettings(
    settings: SurveySensorDataSettings
  ): Observable<SurveySensorDataSettings>;
  readonly cachedSettings: SurveySettings;
  watchSettings(): Observable<SurveySettings>;
}
