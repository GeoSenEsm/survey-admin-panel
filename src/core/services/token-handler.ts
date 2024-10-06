import { Injectable } from "@angular/core";

export interface TokenHandler{
    getClaim(token: string, key: string): string | number | undefined;
}

@Injectable({
    providedIn: 'root'
})
export class JwtTokenHandler implements TokenHandler{

    getClaim(token: string, key: string): string | number | undefined {
        if (!token) {
            return undefined;
        }

        const payload = this.decodeTokenPayload(token);
        if (payload && payload.hasOwnProperty(key)) {
            return payload[key];
        }

        return undefined;
    }

    private decodeTokenPayload(token: string): any {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const decodedPayload = atob(parts[1]);
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Error decoding token payload:', error);
            return null;
        }
    }
}

export const isTokenExpired = (token: string, tokenHandler: TokenHandler) => {
    if (!token) {
        return true;
    }

    const expiration = tokenHandler.getClaim(token, 'exp');
    if (!expiration) {
        return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);

    if (typeof expiration === 'number'){
        return currentTime >= expiration;
    }

    return currentTime >= parseInt(expiration);
}