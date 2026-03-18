import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technician-dashboard.html'
})
export class TechnicianDashboardComponent implements OnInit {
  technician: any = null;
  loading: boolean = true;
  vistaActual: string = 'asignados';
  
  // Reportes
  todosReportes: any[] = [];
  misReportes: any[] = [];
  reportesFiltrados: any[] = [];
  
  // Filtros
  filtroEstatus: string = '';
  filtroTipo: string = '';
  
  // Modal
  reporteSeleccionado: any = null;
  nuevoEstatus: string = '';
  nuevaPrioridad: string = '';
  notasTecnico: string = '';

  constructor(
    private technicianService: TechnicianService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si hay sesión
    const stored = this.technicianService.getStoredTechnician();
    if (!stored) {
      this.router.navigate(['/login-technician']);
      return;
    }
    
    this.technician = stored;
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.loading = true;
    
    // Cargar reportes asignados
    this.technicianService.getAssignedReports(this.technician.id).subscribe({
      next: (data) => {
        this.misReportes = data;
        this.loading = false;
      },
      error: () => {
        this.misReportes = [];
        this.loading = false;
      }
    });

    // Cargar todos los reportes
    this.technicianService.getAllReports().subscribe({
      next: (data) => {
        this.todosReportes = data;
        this.reportesFiltrados = data;
      },
      error: () => {
        this.todosReportes = [];
        this.reportesFiltrados = [];
      }
    });
  }

  filtrarReportes(): void {
    this.reportesFiltrados = this.todosReportes.filter(r => {
      const matchEstatus = !this.filtroEstatus || r.estatus === this.filtroEstatus;
      const matchTipo = !this.filtroTipo || r.tipo === this.filtroTipo;
      return matchEstatus && matchTipo;
    });
  }

  abrirModal(reporte: any): void {
    this.reporteSeleccionado = reporte;
    this.nuevoEstatus = reporte.estatus;
    this.nuevaPrioridad = reporte.prioridad;
    this.notasTecnico = reporte.notasTecnico || '';
    
    // Abrir modal usando Bootstrap
    const modal = document.getElementById('actualizarReporteModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  }

  cerrarModal(): void {
    const modal = document.getElementById('actualizarReporteModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  actualizarReporte(): void {
    if (!this.reporteSeleccionado) return;

    this.technicianService.updateReportStatus(
      this.reporteSeleccionado.clienteId,
      this.reporteSeleccionado._id,
      {
        estatus: this.nuevoEstatus,
        prioridad: this.nuevaPrioridad,
        notasTecnico: this.notasTecnico
      }
    ).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarReportes();
        alert('Reporte actualizado correctamente');
      },
      error: () => {
        alert('Error al actualizar el reporte');
      }
    });
  }

  asignarme(reporte: any): void {
    if (!confirm('¿Deseas asignarte este reporte?')) return;

    this.technicianService.assignTechnician(
      reporte.clienteId,
      reporte._id,
      this.technician.id,
      this.technician.nombre
    ).subscribe({
      next: () => {
        this.cargarReportes();
        alert('Reporte asignado correctamente');
      },
      error: () => {
        alert('Error al asignar el reporte');
      }
    });
  }

  getEstatusClass(estatus: string): string {
    switch (estatus) {
      case 'Pendiente': return 'bg-secondary';
      case 'En Revision': return 'bg-info';
      case 'Asignado': return 'bg-warning text-dark';
      case 'En Proceso': return 'bg-primary';
      case 'Completado': return 'bg-success';
      case 'Cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPrioridadClass(prioridad: string): string {
    switch (prioridad) {
      case 'Baja': return 'bg-light text-dark';
      case 'Normal': return 'bg-info';
      case 'Alta': return 'bg-warning text-dark';
      case 'Urgente': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  logout(): void {
    this.technicianService.logout();
    this.router.navigate(['/login-technician']);
  }
}
