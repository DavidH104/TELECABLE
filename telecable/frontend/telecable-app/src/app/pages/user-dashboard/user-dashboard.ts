import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboard implements OnInit {

  user: any = null;
  nuevoReporte: string = '';
  loading: boolean = true;
  misReportes: any[] = [];
  vistaActual: string = 'cuenta'; // Para la navegacion

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Only check authentication in browser (not during SSR)
    if (!this.isBrowser()) {
      return;
    }
    
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login-user']);
      return;
    }
    
    // Los datos ya vienen del login, pero recargamos para asegurar datos actualizados
    this.userService.getUserById(this.user._id).subscribe({
      next: (userData: any) => {
        // Combinar datos del servidor con datos locales
        this.user = { ...this.user, ...userData };
        // Asegurar que historialPagos y reportes existan
        this.user.historialPagos = this.user.historialPagos || userData.historialPagos || [];
        this.user.reportes = this.user.reportes || userData.reportes || [];
        this.misReportes = this.user.reportes || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar datos del usuario:', err);
        // Si hay error, usamos los datos del localStorage
        this.misReportes = this.user.reportes || [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Los reportes ahora vienen del login, no necesita método separado

  enviarReporte() {
    if (!this.nuevoReporte.trim()) {
      alert('Por favor, escriba un mensaje para su reporte.');
      return;
    }

    this.userService.addReport(this.user._id, this.user.nombre, this.user.numero, this.nuevoReporte).subscribe(
      () => {
        alert('Reporte enviado con éxito.');
        this.nuevoReporte = '';
        // Recargar datos del usuario para ver el nuevo reporte
        this.userService.getUserById(this.user._id).subscribe({
          next: (userData: any) => {
            this.misReportes = userData.reportes || [];
            this.cdr.markForCheck();
          }
        });
      },
      (error) => {
        console.error('Error al enviar el reporte:', error);
        alert('Hubo un error al enviar su reporte. Intente de nuevo.');
      }
    );
  }

  getEstatusBadgeClass(estatus: string): string {
    return estatus === 'atendido' ? 'bg-success' : 'bg-warning text-dark';
  }

  getEstatusTexto(estatus: string): string {
    return estatus === 'atendido' ? 'Atendido' : 'Pendiente';
  }

  generarRecibo(pago: any, index: number) {
    // Find the actual index in historialPagos
    const historialIndex = this.user.historialPagos ? this.user.historialPagos.findIndex((p: any) => 
      p.mes === pago.mes && (p.año === pago.año || p.ano === pago.ano)
    ) : -1;
    
    if (historialIndex >= 0) {
      const url = `${environment.apiUrl}/receipts/${this.user._id}/${historialIndex}`;
      window.open(url, '_blank');
    } else {
      alert('No se pudo encontrar el pago');
    }
  }

  getMesNombre(mes: number): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1] || 'Desconocido';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
