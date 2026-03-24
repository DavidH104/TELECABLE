import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = environment.apiUrl + '/users';
  private reportesApi = environment.apiUrl + '/reportes';
  private receiptsApi = environment.apiUrl + '/receipts';

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

  /** Actualizar usuario completo */
  updateUser(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, data);
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

  /** Actualizar datos del cliente (estatus, paquete, fecha instalación) */
  updateClientData(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/datos`, data);
  }

  /** Registrar pago en historial */
  registerPayment(id: string, data: { mes: number; año: number; monto: number }): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/pago`, data);
  }

  /** Obtener historial de pagos (todos los años) */
  getPaymentHistory(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}/historial`);
  }

  /** Obtener historial de pagos de un año específico (si no se especifica, devuelve todos los años agrupados) */
  getPaymentHistoryByYear(id: string, año?: number): Observable<any> {
    const url = año ? `${this.api}/${id}/historial/${año}` : `${this.api}/${id}/historial`;
    return this.http.get<any>(url);
  }

  /** Registrar un pago */
  registrarPago(id: string, mes: number, año: number, monto: number): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/pago`, { mes, año, monto });
  }

  /** Eliminar un pago */
  eliminarPago(id: string, index: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}/pago/${index}`);
  }

  /** Eliminar un pago del historial */
  deletePayment(id: string, index: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}/pago/${index}`);
  }
}
