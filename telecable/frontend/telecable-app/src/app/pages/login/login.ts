import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports:[CommonModule, FormsModule, RouterModule],
  templateUrl:'./login.html',
  styleUrls: ['./login.css']
})
export class Login {

  mode: 'admin' | 'cliente' | 'registro' = 'admin';

  // Campos de login
  usuario = '';
  password = '';
  contrato = '';

  // Campos de registro de cliente
  nombreRegistro = '';
  telefonoRegistro = '';
  localidadRegistro = '';
  registroExitoso = false;
  contratoRegistrado = '';
  registroDatos: { nombre: string; telefono: string; localidad: string; numero: string } | null = null;
  mostrarInfoOficina = false;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  setMode(mode: 'admin' | 'cliente' | 'registro') {
    this.mode = mode;
    this.registroExitoso = false;
    this.contratoRegistrado = '';
    this.registroDatos = null;
    this.mostrarInfoOficina = false;
  }

  login() {
    if (!this.usuario.trim() || !this.password.trim()) {
      alert('Por favor, ingresa usuario y contraseña');
      return;
    }

    this.auth.loginAdmin(this.usuario, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/admin-dashboard']);
        } else {
          alert('Credenciales incorrectas. Verifica tu usuario y contraseña.');
        }
      },
      error: (err) => {
        console.error('Error de login:', err);
        alert('Error de conexión. Verifica que el backend esté corriendo.');
      }
    });
  }

  loginClient() {
    if (!this.contrato.trim()) {
      alert('Por favor, ingresa tu número de contrato');
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
          alert('Número de contrato no encontrado');
        }
      },
      (error) => {
        console.error('Error:', error);
        alert('Error en el servidor');
      }
    );
  }

  generarNumeroContrato(nombre: string): string {
    const primeraLetra = (nombre || 'U').trim().charAt(0).toUpperCase() || 'U';
    const numeroLetra = primeraLetra.charCodeAt(0) - 64; // A=1, B=2, etc.
    const anio = new Date().getFullYear().toString().slice(-2);
    const aleatorio = Math.floor(10000 + Math.random() * 90000);
    return `${numeroLetra}${anio}${aleatorio}`;
  }

  registrarCliente() {
    if (!this.nombreRegistro.trim() || !this.telefonoRegistro.trim() || !this.localidadRegistro.trim()) {
      alert('Por favor completa todos los campos para registrarte');
      return;
    }

    const nuevoUsuario = {
      nombre: this.nombreRegistro,
      telefono: this.telefonoRegistro,
      localidad: this.localidadRegistro,
      numero: this.generarNumeroContrato(this.nombreRegistro)
    };

    this.userService.addUser(nuevoUsuario).subscribe({
      next: (res) => {
        this.registroExitoso = true;
        this.contratoRegistrado = nuevoUsuario.numero;
        this.registroDatos = { ...nuevoUsuario };
        this.mostrarInfoOficina = false;

        // Limpiar campos de formulario (pero mantener los datos mostrados)
        this.nombreRegistro = '';
        this.telefonoRegistro = '';
        this.localidadRegistro = '';
      },
      error: (err) => {
        console.error('Error al registrar usuario:', err);

        // Si el backend no responde, err.status suele ser 0.
        if (err.status === 0) {
          alert('No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo en http://localhost:5000');
          return;
        }

        const mensaje =
          err.error?.error ||
          err.statusText ||
          err.message ||
          'Error al registrar usuario';
        alert(mensaje);
      }
    });
  }

  solicitarVisitaOficina() {
    // Muestra información práctica para que el cliente pueda acercarse a nuestras oficinas.
    this.mostrarInfoOficina = true;
  }

  irARegistroPassword() {
    this.router.navigate(['/registro-password']);
  }
}
