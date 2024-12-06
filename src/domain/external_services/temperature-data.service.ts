import { Observable } from "rxjs";
import { TemperatureDataFilter } from "../models/temperature-data-filter";
import { TemperatureDataEntry } from "../models/temperature-data-entry";

export interface TemperatureDataService{
    getTemperatureData(filter: TemperatureDataFilter): Observable<TemperatureDataEntry[]>
}