import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreregistroService {
  private api = 'http://localhost:5000/api/preregistros';

  constructor(private http: HttpClient) {}

  crearPreregistro(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}`, data);
  }

  getPreregistros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}`);
  }

  getPreregistrosPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/pendientes`);
  }

  aprobarPreregistro(id: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/${id}/aprobar`, data);
  }

  rechazarPreregistro(id: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/${id}/rechazar`, data);
  }

  eliminarPreregistro(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
