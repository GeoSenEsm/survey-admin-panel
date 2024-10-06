import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { STORAGE_SERVICE_TOKEN } from "./injection-tokens";
import { LocalStorageService } from "./local-storage";

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

    constructor(@Inject(STORAGE_SERVICE_TOKEN) private readonly storage: LocalStorageService){}
    
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.storage.get<string>('token');
        if (token) {
            const modifiedReq = req.clone({
                setHeaders: {
                  'Authorization': `Bearer ${token}`
                }
              });
          
              return next.handle(modifiedReq);
        }

        return next.handle(req);
    }
}