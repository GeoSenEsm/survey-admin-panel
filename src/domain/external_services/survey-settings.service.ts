import { Observable } from 'rxjs';
import { SurveySettings } from '../models/survey-settings';

export interface SurveySettingsService {
  getSettings(): Observable<SurveySettings>;
  updateSettings(settings: SurveySettings): Observable<SurveySettings>;
  readonly cachedSettings: SurveySettings;
  watchSettings(): Observable<SurveySettings>;
}
