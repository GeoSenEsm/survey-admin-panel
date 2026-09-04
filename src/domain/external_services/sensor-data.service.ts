import { Observable } from "rxjs";
import { SensorDataFilter } from "../models/sensor-data-filter";
import { SensorDataEntry } from "../models/sensor-data-entry";
import { HttpEvent } from "@angular/common/http";

export interface SensorDataService{
    getSensorDataWithProgress(filter: SensorDataFilter): Observable<HttpEvent<any>>;
}
