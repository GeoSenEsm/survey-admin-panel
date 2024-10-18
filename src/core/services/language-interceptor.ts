import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {

  constructor(private translateService: TranslateService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentLanguage = this.translateService.currentLang || 'en';

    const modifiedReq = req.clone({
      setHeaders: {
        'Accept-Lang': currentLanguage
      }
    });

    return next.handle(modifiedReq);
  }
}
