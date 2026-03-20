import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promos.html',
  styleUrls: ['./promos.css']
})
export class Promos {

  nuevo: any = {
    nombre: '',
    telefono: '',
    localidad: '',
    paquete: '',
    direccion: ''
  };

  isRegistrando = false;
  mensajeRegistro = '';

  constructor(
    private userService: UserService
  ) {}

  registrar() {
    if (!this.nuevo.nombre || !this.nuevo.telefono || !this.nuevo.localidad || !this.nuevo.paquete) {
      alert('Por favor, completa todos los campos');
      return;
    }

    this.isRegistrando = true;
    this.mensajeRegistro = 'Registrando tu información...';

    this.userService.addUser(this.nuevo).subscribe({
      next: () => {
        this.isRegistrando = false;
        this.mensajeRegistro = '¡Registro completado exitosamente!';
        // Limpiar el formulario
        this.nuevo = {
          nombre: '',
          telefono: '',
          localidad: '',
          paquete: '',
          direccion: ''
        };
      },
      error: (err) => {
        console.error(err);
        this.isRegistrando = false;
        this.mensajeRegistro = 'Error al registrar: ' + (err.error?.error || 'Error desconocido');
      }
    });
  }
}
