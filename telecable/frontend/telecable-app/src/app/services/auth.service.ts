import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:5000/api/auth';
  private currentUserKey = 'currentUser';
  private isAdminKey = 'isAdmin';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Usar localStorage en lugar de sessionStorage para persistencia
  private getStorage(): Storage | null {
    if (!this.isBrowser()) return null;
    return localStorage;
  }

  loginAdmin(usuario: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.api}/admin`, { usuario, password }).pipe(
      tap(res => {
        console.log('Login response:', res);
        if (res && res.admin && this.isBrowser()) {
          localStorage.setItem(this.isAdminKey, 'true');
          localStorage.setItem(this.currentUserKey, JSON.stringify(res.admin));
        }
      }),
      map(res => {
        // Retornar true si hay admin en la respuesta
        return res && res.admin ? true : false;
      }),
      catchError(err => {
        console.error('Login error:', err);
        return of(false);
      })
    );
  }

  loginUser(contrato: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/user`, { contrato, password }).pipe(
      tap(res => {
        if (res && res.user && this.isBrowser()) {
          localStorage.setItem(this.currentUserKey, JSON.stringify(res.user));
          localStorage.setItem(this.isAdminKey, 'false');
        }
      })
    );
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.currentUserKey);
      localStorage.removeItem(this.isAdminKey);
    }
  }

  getCurrentUser(): any | null {
    if (!this.isBrowser()) return null;
    const user = localStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  isAdmin(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(this.isAdminKey) === 'true';
  }

  isUserLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem(this.currentUserKey);
  }

  // Crear nuevo administrador
  createAdmin(usuario: string, password: string, nombre: string): Observable<any> {
    return this.http.post<any>(`${this.api}/admin/crear`, { usuario, password, nombre });
  }

  // Listar administradores
  listAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/admin/listar`);
  }
}
