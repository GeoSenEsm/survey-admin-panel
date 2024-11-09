import { Observable } from "rxjs";
import { LocationData } from "../models/location_data";
import { LocationFilters } from "../models/location-filters";

export interface LocationService{
    getLocationData(filters: LocationFilters): Observable<LocationData[]>;
}