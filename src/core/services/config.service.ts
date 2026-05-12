import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { MapProvider } from './map-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) { }

  loadConfig() {
    return firstValueFrom(
      this.http.get('/assets/config/config.json')
    ).then(config => {
      this.config = config;
    });
  }

  get apiUrl(): string {
    return this.config?.apiUrl;
  }

  get mapProvider(): MapProvider {
    return this.config?.mapProvider === 'baidu' ? 'baidu' : 'openstreetmap';
  }
}
