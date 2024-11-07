import { Observable } from "rxjs";
import { LatLong } from "../models/lat_long";

export interface ResearchAreaService{
    getResearchArea(): Observable<LatLong[]>;
    upsert(nodes: LatLong[]): Observable<LatLong[]>;
    remove(): Observable<void>;
}