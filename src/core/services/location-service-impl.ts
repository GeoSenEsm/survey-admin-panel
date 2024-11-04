import { Observable, of } from "rxjs";
import { LocationService } from "../../domain/external_services/location.service";
import { LocationData } from "../../domain/models/location_data";
import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";
import { LocationFilters } from "../../domain/models/location-filters";

@Injectable({
    providedIn: 'root'
})
export class LocationServiceImpl extends ApiService implements LocationService{

    constructor(client: HttpClient, configService: ConfigService) {
        super(client, configService);
    }

    getLocationData(filters: LocationFilters): Observable<LocationData[]> {

        const locations: LocationData[] = [
            { respondentId: '1', latitude: 52.2297, longitude: 21.0122, date: '2024-11-01', surveyId: 'A' },
            { respondentId: '2', latitude: 52.2300, longitude: 21.0130, date: '2024-11-02', surveyId: 'B' },
            { respondentId: '3', latitude: 52.2310, longitude: 21.0140, date: '2024-11-03', surveyId: undefined }, // Bez surveyId
            { respondentId: '4', latitude: 52.2320, longitude: 21.0150, date: '2024-11-04', surveyId: 'C' },
            { respondentId: '5', latitude: 52.2330, longitude: 21.0160, date: '2024-11-05', surveyId: 'D' },
          ];
      
          return of(locations);
        const actualFilters: any = {
            'from': filters.from.toISOString(),
            'to': filters.to.toISOString(),
            'onlyAutsideResearchArea': filters.onlyAutsideResearchArea
        };

        if (filters.respondentId){
            actualFilters['respondentId'] = filters.respondentId
        }

        if (filters.surveyId){
            actualFilters['surveyId'] = filters.surveyId
        }

        return this.get('/api/localization', actualFilters)
    }
}