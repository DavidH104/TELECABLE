import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body p-4">
              <h2 class="text-center mb-4">Crear Contraseña</h2>
              
              <div *ngIf="!codigoEnviado">
                <p class="text-muted">Ingresa tu número de contrato y teléfono para recibir un código de verificación.</p>
                
                <div class="mb-3">
                  <label class="form-label">Número de Contrato</label>
                  <input type="text" class="form-control" [(ngModel)]="contrato" placeholder="Ingresa tu número de contrato">
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Teléfono Registrado</label>
                  <input type="tel" class="form-control" [(ngModel)]="telefono" placeholder="Ingresa tu teléfono">
                </div>
                
                <button class="btn btn-primary w-100" (click)="solicitarCodigo()">
                  Enviar Código
                </button>
              </div>

              <div *ngIf="codigoEnviado && !passwordEstablecida">
                <p class="text-muted">Se ha enviado un código a tu teléfono. También puedes ver el código en la consola del servidor.</p>
                
                <div class="mb-3">
                  <label class="form-label">Código de Verificación</label>
                  <input type="text" class="form-control" [(ngModel)]="codigo" placeholder="Ingresa el código de 6 dígitos">
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Nueva Contraseña</label>
                  <input type="password" class="form-control" [(ngModel)]="password" placeholder="Crea una contraseña">
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Confirmar Contraseña</label>
                  <input type="password" class="form-control" [(ngModel)]="confirmPassword" placeholder="Confirma tu contraseña">
                </div>
                
                <button class="btn btn-success w-100" (click)="verificarCodigo()">
                  Establecer Contraseña
                </button>
                
                <button class="btn btn-link w-100 mt-2" (click)="codigoEnviado = false">
                  Volver
                </button>
              </div>

              <div *ngIf="passwordEstablecida" class="text-center">
                <div class="alert alert-success">
                  <h4>¡Contraseña establecida!</h4>
                  <p>Ahora puedes iniciar sesión con tu número de contrato y contraseña.</p>
                </div>
                <button class="btn btn-primary" (click)="irALogin()">
                  Ir a Iniciar Sesión
                </button>
              </div>

              <div *ngIf="error" class="alert alert-danger mt-3">
                {{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegistroPassword {
  contrato: string = '';
  telefono: string = '';
  codigo: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  codigoEnviada: boolean = false;
  codigoEnviado: boolean = false;
  passwordEstablecida: boolean = false;
  error: string = '';

  private api = environment.apiUrl + '/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  solicitarCodigo() {
    if (!this.contrato || !this.telefono) {
      this.error = 'Por favor ingresa todos los campos';
      return;
    }

    this.http.post<any>(`${this.api}/solicitar-codigo`, {
      contrato: this.contrato,
      telefono: this.telefono
    }).subscribe({
      next: (res) => {
        this.codigoEnviado = true;
        this.error = '';
        // Mostrar código temporal (solo en desarrollo)
        if (res.codigoTemporal) {
          alert(`Código de verificación: ${res.codigoTemporal}`);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al solicitar código';
      }
    });
  }

  verificarCodigo() {
    if (!this.codigo || !this.password || !this.confirmPassword) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 4) {
      this.error = 'La contraseña debe tener al menos 4 caracteres';
      return;
    }

    this.http.post<any>(`${this.api}/verificar-codigo`, {
      contrato: this.contrato,
      codigo: this.codigo,
      nuevaPassword: this.password
    }).subscribe({
      next: () => {
        this.passwordEstablecida = true;
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al verificar código';
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
