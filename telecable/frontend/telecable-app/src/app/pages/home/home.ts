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
  paquetes: any[] = [];
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
    
    // Cargar configuración general (paquetes + promociones)
    this.configService.getConfig().subscribe({
      next: (config) => {
        if (config) {
          const ahora = new Date();
          this.promociones = (config.promociones || []).filter((p: any) => {
            if (!p.activo) return false;
            if (p.validoHasta) {
              const fechaFin = new Date(p.validoHasta);
              return fechaFin >= ahora;
            }
            return true;
          });

          this.paquetes = (config.paquetes && config.paquetes.length > 0) ? config.paquetes : [
            { clave: 'basico', nombre: 'Básico', precio: 200, velocidad: '20 Mbps', canales: 55, descripcion: 'Ideal para el hogar' },
            { clave: 'estandar', nombre: 'Estándar', precio: 299, velocidad: '50 Mbps', canales: 120, descripcion: 'Perfecto para toda la familia' },
            { clave: 'premium', nombre: 'Premium', precio: 449, velocidad: '100 Mbps', canales: 180, descripcion: 'La mejor experiencia' }
          ];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando config:', err);
        this.loading = false;
        this.paquetes = [
          { clave: 'basico', nombre: 'Básico', precio: 200, velocidad: '20 Mbps', canales: 55, descripcion: 'Ideal para el hogar' },
          { clave: 'estandar', nombre: 'Estándar', precio: 299, velocidad: '50 Mbps', canales: 120, descripcion: 'Perfecto para toda la familia' },
          { clave: 'premium', nombre: 'Premium', precio: 449, velocidad: '100 Mbps', canales: 180, descripcion: 'La mejor experiencia' }
        ];
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
