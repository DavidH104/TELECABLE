import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private api = 'http://localhost:5000/api/config';

  constructor(private http: HttpClient) {}

  getConfig(): Observable<any> {
    return this.http.get<any>(`${this.api}`);
  }

  updateConfig(data: any): Observable<any> {
    return this.http.put<any>(`${this.api}`, data);
  }

  updatePaquete(clave: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/paquete/${clave}`, data);
  }

  getPrecios(): Observable<any> {
    return this.http.get<any>(`${this.api}/precios`);
  }

  getCanales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/canales`);
  }

  addPromocion(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/promociones`, data);
  }

  updatePromocion(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/promociones/${id}`, data);
  }

  deletePromocion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/promociones/${id}`);
  }

  addMensajeGlobal(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/mensajes-globales`, data);
  }

  deleteMensajeGlobal(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/mensajes-globales/${id}`);
  }

  getMensajesGlobales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/mensajes`);
  }

  enviarMensajeUsuario(userId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/mensaje-usuario/${userId}`, data);
  }

  getMensajesUsuario(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/mensajes-usuario/${userId}`);
  }
}
