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
  password = '';
  error = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  login() {
    this.error = '';
    
    if (!this.contrato.trim()) {
      this.error = 'Por favor, ingrese su número de contrato.';
      return;
    }
    
    if (!this.password.trim()) {
      this.error = 'Por favor, ingrese su contraseña.';
      return;
    }

    this.authService.loginUser(this.contrato, this.password).subscribe({
      next: (res) => {
        if (res && res.user) {
          this.router.navigate(['/user-dashboard']);
        } else {
          this.error = 'Credenciales incorrectas';
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        if (err.error?.necesitaPassword) {
          this.error = 'No tienes contraseña establecida. Crea una primero.';
        } else {
          this.error = err.error?.mensaje || 'Error al iniciar sesión';
        }
      }
    });
  }
}
