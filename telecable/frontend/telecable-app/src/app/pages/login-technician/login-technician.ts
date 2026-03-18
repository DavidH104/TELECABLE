import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-login-technician',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-technician.html'
})
export class LoginTechnicianComponent {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  showPassword: boolean = false;

  constructor(
    private technicianService: TechnicianService,
    private router: Router
  ) {
    // Si ya hay sesión de técnico, redirigir al dashboard
    if (this.technicianService.isLoggedIn()) {
      this.router.navigate(['/technician-dashboard']);
    }
  }

  login(): void {
    if (!this.username || !this.password) {
      this.error = 'Por favor ingresa usuario y contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    this.technicianService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        // Guardar técnico en localStorage
        this.technicianService.saveTechnician(response.tecnico);
        // Redirigir al dashboard de técnico
        this.router.navigate(['/technician-dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.mensaje || 'Error al iniciar sesión';
      }
    });
  }
}
