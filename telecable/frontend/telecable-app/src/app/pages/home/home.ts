import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { ConfigService } from '../../services/config.service';
import { PreregistroService } from '../../services/preregistro.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  promociones: any[] = [];
  preRegistros: any[] = [];
  loading: boolean = true;
  isBrowser: boolean;

  constructor(
    private configService: ConfigService,
    private preregistroService: PreregistroService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    
    // Cargar promociones activas
    this.configService.getConfig().subscribe({
      next: (config) => {
        if (config && config.promociones) {
          const ahora = new Date();
          this.promociones = config.promociones.filter((p: any) => {
            if (!p.activa) return false;
            if (p.fechaFin) {
              const fechaFin = new Date(p.fechaFin);
              return fechaFin >= ahora;
            }
            return true;
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando config:', err);
        this.loading = false;
      }
    });

    // Cargar pre-registros pendientes
    this.preregistroService.getPreregistrosPendientes().subscribe({
      next: (data) => {
        this.preRegistros = data;
      },
      error: (err) => {
        console.error('Error cargando pre-registros:', err);
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  irAPreregistro() {
    this.router.navigate(['/preregistro']);
  }
}
