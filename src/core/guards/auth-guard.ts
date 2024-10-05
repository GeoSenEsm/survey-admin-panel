import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { LocalStorageService } from "../services/local-storage";
import { STORAGE_SERVICE_TOKEN } from "../services/injection-tokens";

export const tokenAvailableGuard: () => Promise<boolean> = () =>{
    if (!isTokenAvailable()) {
        return navigateTo('/login');
    }

    return Promise.resolve(true);
}

function isTokenAvailable(): boolean{
    const storageService = inject<LocalStorageService>(STORAGE_SERVICE_TOKEN);
    return storageService.get<string>('token') !== null;
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