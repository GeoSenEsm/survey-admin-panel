import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { LocalStorageService } from "../services/local-storage";
import { STORAGE_SERVICE_TOKEN, TOKEN_HANDLER_TOKEN } from "../services/injection-tokens";
import { isTokenExpired } from "../services/token-handler";

export const tokenAvailableGuard: () => Promise<boolean> = () =>{
    if (!isTokenAvailable()) {
        return navigateTo('/login');
    }

    return Promise.resolve(true);
}

function isTokenAvailable(): boolean{
    const storageService = inject<LocalStorageService>(STORAGE_SERVICE_TOKEN);
    const token = storageService.get<string>('token');

    if (!token){
        return false;
    }

    const tokenHandler = inject(TOKEN_HANDLER_TOKEN);
    if(isTokenExpired(token, tokenHandler)){
        storageService.remove('token');
        return false;
    }

    return true;
}

function navigateTo(route: string): Promise<boolean> {
    const router = inject(Router);
    return router.navigate([route]);
}

export const laodingComponentGuard: () => boolean | Promise<boolean> = () =>{
    if (!isTokenAvailable()) {
        return navigateTo('/login');
    } else{
        return navigateTo('/respondents');
    }
}