import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports:[CommonModule, FormsModule],
  templateUrl: './login-user.html',
})
export class LoginUser {

  contrato = '';
  telefono = '';
  codigo = '';
  password = '';
  error = '';
  success = '';
  loading = false;
  step: 'phone' | 'code' = 'phone';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  requestCode() {
    this.error = '';
    
    if (!this.contrato.trim()) {
      this.error = 'Por favor, ingrese su número de contrato.';
      return;
    }
    
    if (!this.telefono.trim()) {
      this.error = 'Por favor, ingrese su número de teléfono.';
      return;
    }

    this.loading = true;
    this.authService.requestLoginCode(this.contrato, this.telefono).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = 'Código enviado. Revisa la consola (en desarrollo) o tu teléfono.';
        this.step = 'code';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.mensaje || err.error?.error || 'Error al solicitar código';
      }
    });
  }

  login() {
    this.error = '';
    
    if (!this.contrato.trim()) {
      this.error = 'Por favor, ingrese su número de contrato.';
      return;
    }
    
    if (!this.codigo.trim()) {
      this.error = 'Por favor, ingrese el código de verificación.';
      return;
    }
    
    if (!this.password.trim()) {
      this.error = 'Por favor, ingrese su contraseña.';
      return;
    }

    this.loading = true;
    this.authService.verifyLogin(this.contrato, this.codigo, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.user) {
          this.router.navigate(['/user-dashboard']);
        } else {
          this.error = 'Credenciales incorrectas';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.mensaje || err.error?.error || 'Error al iniciar sesión';
      }
    });
  }

  backToPhone() {
    this.step = 'phone';
    this.codigo = '';
    this.password = '';
    this.error = '';
    this.success = '';
  }
}
