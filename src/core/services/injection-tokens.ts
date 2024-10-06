import { InjectionToken } from "@angular/core";
import { LocalStorageService } from "./local-storage";
import { STORAGE_SERVICE, TOKEN_HANDLER } from "./registration-names";
import { TokenHandler } from "./token-handler";

export const STORAGE_SERVICE_TOKEN: InjectionToken<LocalStorageService>
= new InjectionToken<LocalStorageService>(STORAGE_SERVICE);

export const TOKEN_HANDLER_TOKEN: InjectionToken<TokenHandler>
= new InjectionToken<TokenHandler>(TOKEN_HANDLER);