import { InjectionToken } from "@angular/core";
import { LocalStorageService } from "./local-storage";
import { STORAGE_SERVICE } from "./registration-names";

export const STORAGE_SERVICE_TOKEN: InjectionToken<LocalStorageService>
= new InjectionToken<LocalStorageService>(STORAGE_SERVICE);