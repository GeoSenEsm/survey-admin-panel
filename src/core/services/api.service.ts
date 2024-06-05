import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export class ApiService {
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private readonly httpClient: HttpClient) { }

  protected post<T>(url: string, data: any): Observable<T> {
    return this.httpClient.post<T>(this.baseUrl + url, data);
  }

  protected get<T>(url: string, params?: { [param: string]: string | number }): Observable<T> {
    let queryParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        queryParams = queryParams.append(key, params[key].toString());
      });
    }

    return this.httpClient.get<T>(this.baseUrl + url, { params: queryParams });
  }
}
