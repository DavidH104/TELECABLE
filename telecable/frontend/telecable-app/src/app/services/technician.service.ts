import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {
  private apiUrl = environment.apiUrl + '/technicians';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  getTechnicians(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTechnician(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTechnician(technician: any): Observable<any> {
    return this.http.post(this.apiUrl, technician);
  }

  updateTechnician(id: string, technician: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, technician);
  }

  deleteTechnician(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAllReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/todos`);
  }

  getAssignedReports(technicianId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/asignados/${technicianId}`);
  }

  updateReportStatus(clienteId: string, reporteId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reportes/${clienteId}/${reporteId}`, data);
  }

  assignTechnician(clienteId: string, reporteId: string, tecnicoId: string, tecnicoNombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reportes/asignar/${clienteId}/${reporteId}`, {
      tecnicoId,
      tecnicoNombre
    });
  }

  // Guardar técnico en localStorage
  saveTechnician(technician: any): void {
    if (this.isBrowser) {
      localStorage.setItem('technician', JSON.stringify(technician));
    }
  }

  // Obtener técnico del localStorage
  getStoredTechnician(): any {
    if (!this.isBrowser) return null;
    const technician = localStorage.getItem('technician');
    return technician ? JSON.parse(technician) : null;
  }

  // Cerrar sesión
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('technician');
    }
  }

  // Verificar si hay sesión activa
  isLoggedIn(): boolean {
    return this.getStoredTechnician() !== null;
  }
}
