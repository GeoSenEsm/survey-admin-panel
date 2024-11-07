import { Observable, of } from 'rxjs';
import { ResearchAreaService } from '../../domain/external_services/research_area.service';
import { LatLong } from '../../domain/models/lat_long';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ResearchAreaServiceImpl
  extends ApiService
  implements ResearchAreaService {

    constructor(client: HttpClient, configService: ConfigService) {
        super(client, configService);
    }

    getResearchArea(): Observable<LatLong[]> {
        const coordinates: LatLong[] = [
            { longitude: 21.011780, latitude: 52.229800 },
            { longitude: 21.027800, latitude: 52.229800 },
            { longitude: 21.027800, latitude: 52.246800 },
            { longitude: 21.011780, latitude: 52.246800 },
            { longitude: 21.011780, latitude: 52.229800 }
          ];

          return of(coordinates);

        return this.get('/api/researcharea');
    }
    upsert(nodes: LatLong[]): Observable<LatLong[]> {
        return this.post('/api/researcharea', nodes);
    }

    remove(): Observable<void> {
        return this.delete('/api/researcharea');
    }
}
