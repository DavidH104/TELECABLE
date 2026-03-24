import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl + '/notifications';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getAdminNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin`);
  }

  getAdminUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/admin/no-leidas`);
  }

  getUserNotifications(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  getUserUnreadCount(usuarioId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/usuario/${usuarioId}/no-leidas`);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/leida`, {});
  }

  markAllAdminAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/leer-todas`, {});
  }

  markAllUserAsRead(usuarioId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuario/${usuarioId}/leer-todas`, {});
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }
}

