import { Observable, of, throwError } from "rxjs";
import { TemperatureDataService } from "../../domain/external_services/temperature-data.service";
import { TemperatureDataEntry } from "../../domain/models/temperature-data-entry";
import { TemperatureDataFilter } from "../../domain/models/temperature-data-filter";
import { ApiService } from "./api.service";
import { HttpClient, HttpEvent } from "@angular/common/http";
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

        getTemperatureDataWithProgress(filter: TemperatureDataFilter): Observable<HttpEvent<any>> {
        const filterMap: any = {
            'from': filter.from.toISOString(),
            'to': filter.to.toISOString()
        };

        if (filter.respondentId){
            filterMap['respondentId'] = filter.respondentId;
        }
        return this.getWithProgress(`/api/sensordata`, filterMap);
    }
}
