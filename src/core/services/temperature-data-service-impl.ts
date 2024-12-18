import { Observable, of, throwError } from "rxjs";
import { TemperatureDataService } from "../../domain/external_services/temperature-data.service";
import { TemperatureDataEntry } from "../../domain/models/temperature-data-entry";
import { TemperatureDataFilter } from "../../domain/models/temperature-data-filter";
import { ApiService } from "./api.service";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";
import { Injectable } from "@angular/core";

@Injectable()
export class TemperatureDataServiceImpl 
extends ApiService
implements TemperatureDataService{

    constructor(httpClient: HttpClient,
        configService: ConfigService){
            super(httpClient, configService);
        }

    getTemperatureData(filter: TemperatureDataFilter): Observable<TemperatureDataEntry[]> {
        const filterMap: any = {
            'from': filter.from.toISOString(),
            'to': filter.to.toISOString()
        };

        if (filter.respondentId){
            filterMap['respondentId'] = filter.respondentId;
        }
        return this.get(`/api/sensordata`, filterMap);
    }
}