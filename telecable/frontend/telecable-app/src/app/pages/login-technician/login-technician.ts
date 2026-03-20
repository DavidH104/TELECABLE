import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnicianService } from '../../services/technician.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login-technician',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-technician.html'
})
export class LoginTechnicianComponent implements OnInit {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  showPassword: boolean = false;

  constructor(
    private technicianService: TechnicianService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.technicianService.isLoggedIn()) {
        this.router.navigate(['/technician-dashboard']);
      }
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
        if (response && response.tecnico) {
          this.technicianService.saveTechnician(response.tecnico);
          this.router.navigate(['/technician-dashboard']);
        } else {
          this.error = 'Error en la respuesta del servidor';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.mensaje || err.message || 'Error al iniciar sesión';
      }
    });
  }
}
