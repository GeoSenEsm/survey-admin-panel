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
        const actualFilters: any = {
            'from': filters.from.toISOString(),
            'to': filters.to.toISOString()
        };

        if (filters.respondentId){
            actualFilters['respondentId'] = filters.respondentId
        }

        if (filters.surveyId){
            actualFilters['surveyId'] = filters.surveyId
        }

        if (filters.outsideResearchArea != undefined){
            actualFilters['outsideResearchArea'] = filters.outsideResearchArea
        }

        return this.get('/api/localization', actualFilters)
    }
}