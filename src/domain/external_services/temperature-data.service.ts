import { Observable } from "rxjs";
import { TemperatureDataFilter } from "../models/temperature-data-filter";
import { TemperatureDataEntry } from "../models/temperature-data-entry";
import { HttpEvent } from "@angular/common/http";

export interface TemperatureDataService{
    getTemperatureDataWithProgress(filter: TemperatureDataFilter): Observable<HttpEvent<any>>;
}
