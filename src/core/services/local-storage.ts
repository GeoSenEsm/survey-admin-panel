import { Injectable } from "@angular/core";

export interface LocalStorageService{
    get<T>(key: string): T | null;
    save<T>(key: string, value: T): void;
}

@Injectable({
    providedIn: 'root'
})
export class CookieStorageService implements LocalStorageService{


    get<T>(key: string): T | null {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [cookieKey, cookieValue] = cookie.split('=');
            if (cookieKey === key) {
            return JSON.parse(decodeURIComponent(cookieValue)) as T;
        }
        }
        return null;
    }


    save<T>(key: string, value: T): void {
        const serializedValue = encodeURIComponent(JSON.stringify(value));
        document.cookie = `${key}=${serializedValue}; path=/;`;
    }   
}