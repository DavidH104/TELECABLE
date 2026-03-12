import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html'
})
export class Reportes {

  userId = '';
  mensaje = '';

  constructor(private http: HttpClient) {}

  enviarReporte() {

    this.http.put(
      "http://localhost:3000/api/reportes/" + this.userId,
      { mensaje: this.mensaje }
    ).subscribe(() => {

      alert("Reporte enviado");
      this.mensaje = '';

    });

  }

}