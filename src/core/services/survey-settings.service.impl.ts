import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import {
  CreateSensorParameterDefinitionRequest,
  DEFAULT_SURVEY_SETTINGS,
  EditSensorParameterDefinitionRequest,
  SensorParameterDefinition,
  SurveySensorDataSettings,
  SurveySensorDataSettingsWrite,
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

  uploadLogo(file: File): Observable<SurveySettings> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.post<SurveySettings>('/api/surveysettings/logo', formData).pipe(
      tap((updated) => this.cachedSettings$.next(updated))
    );
  }

  deleteLogo(): Observable<SurveySettings> {
    return this.delete<SurveySettings>('/api/surveysettings/logo').pipe(
      tap((updated) => this.cachedSettings$.next(updated))
    );
  }

  getSensorDataSettings(): Observable<SurveySensorDataSettings> {
    return this.get<SurveySensorDataSettings>('/api/surveysettings/sensordata');
  }

  updateSensorDataSettings(
    settings: SurveySensorDataSettingsWrite
  ): Observable<SurveySensorDataSettings> {
    return this.put('/api/surveysettings/sensordata', settings);
  }

  createSensorParameterDefinition(
    request: CreateSensorParameterDefinitionRequest
  ): Observable<SensorParameterDefinition> {
    return this.post('/api/surveysettings/sensordata/parameters', request);
  }

  updateSensorParameterDefinition(
    id: string,
    request: EditSensorParameterDefinitionRequest
  ): Observable<SensorParameterDefinition> {
    return this.put(
      `/api/surveysettings/sensordata/parameters/${encodeURIComponent(id)}`,
      request
    );
  }

  deleteSensorParameterDefinition(id: string): Observable<void> {
    return this.delete(`/api/surveysettings/sensordata/parameters/${encodeURIComponent(id)}`);
  }
}
