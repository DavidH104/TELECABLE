import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = 'http://localhost:5000/api/users';
  private reportesApi = 'http://localhost:5000/api/reportes';
  private receiptsApi = 'http://localhost:5000/api/receipts';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/buscar/${query}`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  /** Obtener usuario por número de contrato (para panel cliente) */
  getByContrato(contrato: number | string): Observable<any> {
    return this.http.get<any>(`${this.api}/contrato/${contrato}`);
  }

  /** Crear un nuevo usuario/cliente */
  addUser(user: any): Observable<any> {
    return this.http.post<any>(this.api, user);
  }

  /** Actualizar estatus de un usuario */
  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.api}/estatus/${id}`, { estatus: status });
  }

  /** Actualizar deuda de un usuario */
  updateDebt(id: string, debt: number): Observable<any> {
    return this.http.put<any>(`${this.api}/deuda/${id}`, { deuda: debt });
  }

  /** Registrar un pago (recibo) para un usuario */
  addPaymentRecord(id: string, amount: number): Observable<any> {
    return this.http.put<any>(`${this.api}/recibo/${id}`, { monto: amount });
  }

  /** Agregar un reporte a un usuario */
  addReport(usuarioId: string, nombreCliente: string, numeroContrato: string, mensaje: string): Observable<any> {
    return this.http.post<any>(this.reportesApi, { 
      usuarioId, 
      nombreCliente, 
      numeroContrato, 
      mensaje 
    });
  }

  /** Obtener todos los reportes */
  getReports(): Observable<any[]> {
    return this.http.get<any[]>(this.reportesApi);
  }

  /** Marcar reporte como atendido */
  markReportAttended(reportId: string): Observable<any> {
    return this.http.put<any>(`${this.reportesApi}/${reportId}/atendido`, {});
  }

  /** Marcar reporte como pendiente (reabrir) */
  markReportPending(reportId: string): Observable<any> {
    return this.http.put<any>(`${this.reportesApi}/${reportId}/pendiente`, {});
  }

  /** Eliminar un reporte */
  deleteReport(reportId: string): Observable<any> {
    return this.http.delete<any>(`${this.reportesApi}/${reportId}`);
  }

  /** Obtener reportes de un usuario */
  getUserReports(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.reportesApi}/usuario/${usuarioId}`);
  }

  /** Descargar un recibo en PDF */
  downloadReceipt(userId: string, paymentId: string): Observable<Blob> {
    return this.http.get(`${this.receiptsApi}/${userId}/${paymentId}`, {
      responseType: 'blob'
    });
  }

  /** Eliminar un usuario */
  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
