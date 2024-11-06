import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export class ApiService {
  private readonly baseUrl: string;

  constructor(private readonly httpClient: HttpClient,
    configService: ConfigService) { 
      this.baseUrl = configService.apiUrl;
    }

  protected post<T>(url: string, data: any, responseType: string | undefined = 'json'): Observable<T> {
    return this.httpClient.post<T>(this.baseUrl + url, data, {
      responseType: responseType as 'json'
    });
  }

  protected get<T>(url: string, params?: { [param: string]: string | number | boolean }): Observable<T> {
    let queryParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        queryParams = queryParams.append(key, params[key].toString());
      });
    }

    return this.httpClient.get<T>(this.baseUrl + url, { params: queryParams });
  }
}
