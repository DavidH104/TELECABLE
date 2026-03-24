import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports:[CommonModule, FormsModule],
  templateUrl:'./login.html',
  styleUrls: ['./login.css']
})
export class Login {

  usuario='';
  password='';
  contrato='';
  isAdminMode: boolean = false;

  constructor(
    private auth: AuthService, 
    private userService: UserService,
    private router: Router
  ){}

  login() {
    if (!this.usuario.trim() || !this.password.trim()) {
      alert("Por favor, ingresa usuario y contraseña");
      return;
    }
    
    this.auth.loginAdmin(this.usuario, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/admin-dashboard']);
        } else {
          alert("Credenciales incorrectas. Verifica tu usuario y contraseña.");
        }
      },
      error: (err) => {
        console.error('Error de login:', err);
        alert("Error de conexión. Verifica que el backend esté corriendo.");
      }
    });
  }

  loginClient() {
    if (!this.contrato.trim()) {
      alert("Por favor, ingresa tu número de contrato");
      return;
    }

    this.userService.getByContrato(this.contrato).subscribe(
      (user) => {
        if (user) {
          // Usar localStorage para persistencia
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('isAdmin', 'false');
          this.router.navigate(['/user-dashboard']);
        } else {
          alert("Número de contrato no encontrado");
        }
      },
      (error) => {
        console.error('Error:', error);
        alert("Error en el servidor");
      }
    );
  }
}
