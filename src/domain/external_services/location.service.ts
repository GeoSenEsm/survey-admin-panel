import { Observable } from "rxjs";
import { LocationFilters } from "../models/location-filters";
import { HttpEvent } from "@angular/common/http";

export interface LocationService{
    getLocationDataWithProgress(filters: LocationFilters): Observable<HttpEvent<any>>;
}
