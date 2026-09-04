import { Observable } from "rxjs";
import { SensorDataService } from "../../domain/external_services/sensor-data.service";
import { SensorDataEntry } from "../../domain/models/sensor-data-entry";
import { SensorDataFilter } from "../../domain/models/sensor-data-filter";
import { ApiService } from "./api.service";
import { HttpClient, HttpEvent } from "@angular/common/http";
import { ConfigService } from "./config.service";
import { Injectable } from "@angular/core";

@Injectable()
export class SensorDataServiceImpl
extends ApiService
implements SensorDataService{

    constructor(httpClient: HttpClient,
        configService: ConfigService){
            super(httpClient, configService);
        }

        getSensorDataWithProgress(filter: SensorDataFilter): Observable<HttpEvent<any>> {
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
