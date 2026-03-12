import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.html'
})
export class UserDashboard implements OnInit {

  user: any = null;
  nuevoReporte: string = '';
  loading: boolean = true;
  misReportes: any[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Recargar datos del usuario para obtener recibos actualizados
    this.userService.getUserById(this.user._id).subscribe({
      next: (userData: any) => {
        this.user = userData;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar datos del usuario:', err);
        // Si hay error, usamos los datos de sessionStorage
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Cargar mis reportes
    this.cargarMisReportes();
  }

  cargarMisReportes() {
    this.userService.getUserReports(this.user._id).subscribe({
      next: (reportes) => {
        this.misReportes = reportes;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar reportes:', err)
    });
  }

  enviarReporte() {
    if (!this.nuevoReporte.trim()) {
      alert('Por favor, escriba un mensaje para su reporte.');
      return;
    }

    this.userService.addReport(this.user._id, this.user.nombre, this.user.numero, this.nuevoReporte).subscribe(
      () => {
        alert('Reporte enviado con exito.');
        this.nuevoReporte = ''; // Limpiar el campo de texto
        this.cargarMisReportes(); // Recargar la lista de reportes
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
    const url = `http://localhost:5000/api/receipts/${this.user._id}/${index}`;
    window.open(url, '_blank');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
