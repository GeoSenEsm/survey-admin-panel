import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import {
  DEFAULT_SURVEY_SETTINGS,
  SurveySettings,
} from '../../domain/models/survey-settings';
import { SurveySettingsService } from '../../domain/external_services/survey-settings.service';

@Injectable({
  providedIn: 'root',
})
export class SurveySettingsServiceImpl
  extends ApiService
  implements SurveySettingsService
{
  private readonly cachedSettings$ = new BehaviorSubject<SurveySettings>(
    DEFAULT_SURVEY_SETTINGS
  );

  constructor(client: HttpClient, configService: ConfigService) {
    super(client, configService);
  }

  get cachedSettings(): SurveySettings {
    return this.cachedSettings$.value;
  }

  watchSettings(): Observable<SurveySettings> {
    return this.cachedSettings$.asObservable();
  }

  getSettings(): Observable<SurveySettings> {
    return this.get<SurveySettings>('/api/surveysettings').pipe(
      tap((settings) => this.cachedSettings$.next(settings))
    );
  }

  updateSettings(settings: SurveySettings): Observable<SurveySettings> {
    return this.put('/api/surveysettings', settings).pipe(
      tap((updated: SurveySettings) => this.cachedSettings$.next(updated))
    );
  }
}
