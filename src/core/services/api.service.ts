import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class ApiService {
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private readonly httpClient: HttpClient) { }

  protected post<T>(url: string, data: any): Observable<T> {
    return this.httpClient.post<T>(this.baseUrl + url, data);
  }

  protected get<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(this.baseUrl + url);
  }
}
