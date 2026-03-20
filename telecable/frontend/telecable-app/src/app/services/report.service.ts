import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private api = 'http://localhost:5000/api/reportes';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getReportes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}`);
  }

  getReporteById(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  createReporte(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}`, data);
  }

  updateReporte(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }

  deleteReporte(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }

  getReportesByTecnico(tecnicoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/tecnico/${tecnicoId}`);
  }

  getReportesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}?estado=pendiente`);
  }

  asignarTecnico(reporteId: string, tecnicoId: string, tecnicoNombre: string, clienteId: string): Observable<any> {
    return this.http.put<any>(`${this.api}/${reporteId}/asignar-tecnico`, {
      tecnicoId,
      tecnicoNombre,
      clienteId
    });
  }
}
