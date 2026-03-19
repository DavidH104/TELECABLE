import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PreregistroService } from '../../services/preregistro.service';

@Component({
  selector: 'app-preregistro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preregistro.html'
})
export class PreregistroComponent implements OnInit {
  nombre: string = '';
  telefono: string = '';
  direccion: string = '';
  
  loading: boolean = false;
  error: string = '';
  success: string = '';
  submitted: boolean = false;

  constructor(
    private preregistroService: PreregistroService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  submit() {
    if (!this.nombre || !this.telefono || !this.direccion) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const data = {
      nombre: this.nombre,
      telefono: this.telefono,
      direccion: this.direccion,
      paquete: 'basico',
      precio: 200
    };

    this.preregistroService.crearPreregistro(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = 'Tu solicitud ha sido enviada. Te contactaremos pronto.';
        this.submitted = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al enviar solicitud';
      }
    });
  }

  volver() {
    this.router.navigate(['/login']);
  }
}
