import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { TechnicianService } from '../../services/technician.service';
import { ReportService } from '../../services/report.service';
import { PreregistroService } from '../../services/preregistro.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {

  // Datos crudos sin procesar
  rawData: any[] = [];
  historialPagos: any[] = [];
  clientesActivos: number = 0;
  clientesSuspendidos: number = 0;
  ingresosDelMes: number = 0;

  // Campo de búsqueda
  searchQuery: string = '';
  terminoBusqueda: string = '';
  resultadosBusqueda: any[] = [];
  mostrarFormulario: boolean = false;
  mostrarFormularioAdmin: boolean = false;
  private _vistaActual: string = 'clientes';
  
  get vistaActual(): string {
    return this._vistaActual;
  }
  
  set vistaActual(value: string) {
    this._vistaActual = value;
  }
  
  reportes: any[] = [];
  admins: any[] = [];

  nuevo: any = {
    numero: "",
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    localidad: ""
  };

  // Nuevo admin
  nuevoAdmin: any = {
    usuario: "",
    password: "",
    nombre: ""
  };

  // Técnicos
  tecnicos: any[] = [];
  mostrarFormularioTecnico: boolean = false;
  nuevoTecnico: any = {
    username: '',
    password: '',
    nombre: '',
    telefono: '',
    email: '',
    especialidad: 'Todas'
  };

  // Solicitudes de registro
  solicitudesPendientes: number = 0;
  solicitudesRegistro: any[] = [];
  preregistros: any[] = [];
  preregistrosPendientes: number = 0;
  preregistroSeleccionado: any = null;
  nuevoNumeroContrato: string = '';
  reportesParaAsignar: any[] = [];
  reporteSeleccionado: any = null;
  tecnicoSeleccionado: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private technicianService: TechnicianService,
    private reportService: ReportService,
    private preregistroService: PreregistroService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadReportes();
  }

  loadReportes() {
    // Cargar reportes de la nueva coleccion
    this.userService.getReports().subscribe({
      next: (reportes) => {
        this.reportes = reportes.map(r => ({
          _id: r._id,
          nombre: r.nombreCliente,
          numero: r.numeroContrato,
          mensaje: r.mensaje,
          fecha: r.fecha,
          estatus: r.estatus
        }));
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar reportes:', err)
    });

    // Cargar historial de pagos
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.historialPagos = [];
        for (const u of users) {
          if (u.recibos && u.recibos.length > 0) {
            for (const p of u.recibos) {
              this.historialPagos.push({
                nombre: u.nombre,
                numero: u.numero,
                monto: p.monto,
                fecha: p.fecha
              });
            }
          }
        }
        this.cdr.markForCheck();
      }
    });
  }

  loadData() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        console.log('Recibido:', data);
        this.rawData = data;
        this.processData();
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  processData() {
    this.clientesActivos = 0;
    this.clientesSuspendidos = 0;
    this.ingresosDelMes = 0;
    this.historialPagos = [];

    for (const u of this.rawData) {
      // Agregar campos de movimiento
      u.mov = null;
      u.pago = null;
      
      // Contar statuses
      if (u.estatus === 'Activo') this.clientesActivos++;
      if (u.estatus === 'Suspendido') this.clientesSuspendidos++;

      // Procesar recibos
      if (u.recibos && u.recibos.length > 0) {
        for (const r of u.recibos) {
          this.historialPagos.push({
            nombre: u.nombre,
            fecha: r.fecha,
            monto: r.monto,
            userId: u._id,
            paymentId: r._id
          });
        }
      }
    }

    // Ordenar pagos por fecha
    this.historialPagos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Calcular ingresos del mes
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    for (const pago of this.historialPagos) {
      const fechaPago = new Date(pago.fecha);
      if (fechaPago >= primerDia) {
        this.ingresosDelMes += pago.monto;
      }
    }
  }

  get users() {
    return this.rawData;
  }

  // Recargar datos manteniendo la búsqueda
  recargarDatos() {
    if (this.searchQuery.trim()) {
      this.buscar();
    } else {
      this.loadData();
    }
  }

  // Generar número de contrato aleatorio
  generarNumeroContrato(): string {
    const primeraLetra = this.nuevo.nombre.trim().charAt(0).toUpperCase();
    const numeroLetra = primeraLetra.charCodeAt(0) - 64; // A=1, B=2, etc.
    const anio = '26';
    const aleatorio = Math.floor(10000 + Math.random() * 90000);
    return `${numeroLetra}${anio}${aleatorio}`;
  }

  agregar() {
    if (!this.nuevo.nombre) {
      alert("Ingresa el nombre del cliente");
      return;
    }

    // Auto-generar número de contrato si no existe
    if (!this.nuevo.numero) {
      this.nuevo.numero = this.generarNumeroContrato();
    }

    this.userService.addUser(this.nuevo).subscribe({
      next: () => {
        this.nuevo = { numero: "", nombre: "", correo: "", telefono: "", direccion: "", localidad: "" };
        this.mostrarFormulario = false;
        this.loadData();
        alert("Cliente agregado correctamente");
      },
      error: (err) => {
        console.error(err);
        // Mostrar el mensaje de error del backend si existe
        const mensaje = err.error?.error || "Error al agregar cliente";
        alert(mensaje);
      }
    });
  }

  buscar() {
    // El buscador ahora filtra los usuarios en la vista
    // Se usa en el getter de users
  }

  get usersFiltrados() {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      return this.rawData;
    }
    const termino = this.terminoBusqueda.toLowerCase();
    return this.rawData.filter(u => 
      u.nombre?.toLowerCase().includes(termino) || 
      u.numero?.toLowerCase().includes(termino) ||
      u.telefono?.toLowerCase().includes(termino) ||
      u.localidad?.toLowerCase().includes(termino)
    );
  }

  verDetalle(user: any) {
    alert(`Cliente: ${user.nombre}\nNumero: ${user.numero}\nTelefono: ${user.telefono}\nLocalidad: ${user.localidad}\nEstatus: ${user.estatus}\nDeuda: ${user.deuda}`);
  }

  estatus(user: any, event: any) {
    const nuevoEstatus = event.target.value;
    this.userService.updateStatus(user._id, nuevoEstatus).subscribe({
      next: () => {
        user.estatus = nuevoEstatus;
        this.recargarDatos();
      },
      error: (err) => {
        console.error('Error al actualizar estatus:', err);
        alert('Error al actualizar estatus');
      }
    });
  }

  eliminarUsuario(user: any) {
    console.log('Intentando eliminar usuario:', user);
    console.log('ID del usuario:', user._id);
    if (confirm(`¿Estás seguro de eliminar al usuario "${user.nombre}"?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: (res) => {
          console.log('Usuario eliminado:', res);
          alert('Usuario eliminado correctamente');
          this.recargarDatos();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('Error al eliminar usuario: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  sumar(user: any) {
    if (!user.mov || user.mov <= 0) {
      alert("Monto inválido");
      return;
    }
    // Enviar solo el monto a sumar (el backend ahora suma)
    this.userService.updateDebt(user._id, Number(user.mov)).subscribe(() => {
      user.mov = null;
      this.recargarDatos();
    });
  }

  pagar(user: any) {
    if (!user.pago || user.pago <= 0) {
      alert("Monto inválido");
      return;
    }
    this.userService.addPaymentRecord(user._id, Number(user.pago)).subscribe(() => {
      user.pago = null;
      this.recargarDatos();
    });
  }

  generarRecibo(pago: any) {
    window.open(`http://localhost:5000/api/receipts/${pago.userId}/${pago.paymentId}`, '_blank');
  }

  // Atender un reporte (marcar como atendido)
  atenderReporte(reporte: any) {
    this.userService.markReportAttended(reporte._id).subscribe({
      next: () => {
        reporte.estatus = 'atendido';
        this.cdr.markForCheck();
        alert('Reporte marcado como atendido');
      },
      error: (err) => {
        console.error('Error al atender reporte:', err);
        alert('Error al atender reporte');
      }
    });
  }

  // Reabrir un reporte (marcar como pendiente)
  reabrirReporte(reporte: any) {
    this.userService.markReportPending(reporte._id).subscribe({
      next: () => {
        reporte.estatus = 'pendiente';
        this.cdr.markForCheck();
        alert('Reporte marcado como pendiente');
      },
      error: (err) => {
        console.error('Error al reabrir reporte:', err);
        alert('Error al reabrir reporte');
      }
    });
  }

  // Eliminar un reporte
  eliminarReporte(reporte: any) {
    if (!confirm('Estas seguro de eliminar este reporte?')) {
      return;
    }
    this.userService.deleteReport(reporte._id).subscribe({
      next: () => {
        this.reportes = this.reportes.filter(r => r._id !== reporte._id);
        this.cdr.markForCheck();
        alert('Reporte eliminado');
      },
      error: (err) => {
        console.error('Error al eliminar reporte:', err);
        alert('Error al eliminar reporte');
      }
    });
  }

  // Cargar lista de admins
  loadAdmins() {
    this.authService.listAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar admins:', err)
    });
  }

  // Crear nuevo admin
  crearAdmin() {
    if (!this.nuevoAdmin.usuario || !this.nuevoAdmin.password) {
      alert('Usuario y contraseña son requeridos');
      return;
    }

    this.authService.createAdmin(
      this.nuevoAdmin.usuario,
      this.nuevoAdmin.password,
      this.nuevoAdmin.nombre
    ).subscribe({
      next: () => {
        alert('Administrador creado exitosamente');
        this.nuevoAdmin = { usuario: '', password: '', nombre: '' };
        this.mostrarFormularioAdmin = false;
        this.loadAdmins();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al crear administrador');
      }
    });
  }

  // Cargar lista de técnicos
  loadTechnicians() {
    this.technicianService.getTechnicians().subscribe({
      next: (tecnicos) => {
        this.tecnicos = tecnicos;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar técnicos:', err)
    });
  }

  // Crear nuevo técnico
  crearTecnico() {
    if (!this.nuevoTecnico.username || !this.nuevoTecnico.password || !this.nuevoTecnico.nombre) {
      alert('Usuario, contraseña y nombre son requeridos');
      return;
    }

    this.technicianService.createTechnician(this.nuevoTecnico).subscribe({
      next: () => {
        alert('Técnico creado exitosamente');
        this.nuevoTecnico = { username: '', password: '', nombre: '', telefono: '', email: '', especialidad: 'Todas' };
        this.mostrarFormularioTecnico = false;
        this.loadTechnicians();
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al crear técnico');
      }
    });
  }

  // Editar técnico
  editarTecnico(tech: any) {
    const nuevoUsername = prompt('Usuario:', tech.username);
    if (nuevoUsername === null) return;
    
    const nuevoNombre = prompt('Nombre del técnico:', tech.nombre);
    if (nuevoNombre === null) return;
    
    const nuevaEspecialidad = prompt('Especialidad (Instalaciones, Reparaciones, General, Todas):', tech.especialidad);
    if (nuevaEspecialidad === null) return;

    const nuevaPassword = prompt('Nueva contraseña (dejar vacío para mantener la actual):');
    // Si el usuario no quiere cambiar la contraseña, no enviamos el campo

    const datosActualizar: any = {
      username: nuevoUsername,
      nombre: nuevoNombre,
      especialidad: nuevaEspecialidad
    };

    // Solo agregamos password si el usuario proporcionó una nueva
    if (nuevaPassword && nuevaPassword.trim() !== '') {
      datosActualizar.password = nuevaPassword;
    }

    this.technicianService.updateTechnician(tech._id, datosActualizar).subscribe({
      next: () => {
        alert('Técnico actualizado');
        this.loadTechnicians();
      },
      error: (err) => alert(err.error?.mensaje || 'Error al actualizar técnico')
    });
  }

  // Activar/desactivar técnico
  toggleTecnico(tech: any) {
    const accion = tech.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Deseas ${accion} este técnico?`)) return;

    this.technicianService.updateTechnician(tech._id, {
      activo: !tech.activo
    }).subscribe({
      next: () => {
        alert(`Técnico ${accion === 'activar' ? 'activado' : 'desactivado'}`);
        this.loadTechnicians();
      },
      error: () => alert('Error al actualizar técnico')
    });
  }

  // Eliminar técnico
  eliminarTecnico(tech: any) {
    if (!confirm(`¿Estás seguro de eliminar al técnico "${tech.nombre}"?`)) return;

    this.technicianService.deleteTechnician(tech._id).subscribe({
      next: () => {
        alert('Técnico eliminado');
        this.loadTechnicians();
      },
      error: () => alert('Error al eliminar técnico')
    });
  }

  // ==================== SOLICITUDES DE REGISTRO ====================
  
  // Cargar solicitudes de registro pendientes
  loadSolicitudes() {
    this.authService.getSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudesRegistro = solicitudes;
        this.solicitudesPendientes = solicitudes.filter((s: any) => s.estado === 'pendiente').length;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar solicitudes:', err)
    });
  }

  // Aprobar solicitud de registro
  aprobarSolicitud(solicitud: any) {
    if (!confirm(`¿Aprobar la solicitud de ${solicitud.nombre}?`)) return;
    
    this.authService.aprobarSolicitud(solicitud._id).subscribe({
      next: () => {
        alert('Solicitud aprobada. El usuario podrá iniciar sesión.');
        this.loadSolicitudes();
      },
      error: (err) => alert(err.error?.error || 'Error al aprobar solicitud')
    });
  }

  // Rechazar solicitud de registro
  rechazarSolicitud(solicitud: any) {
    if (!confirm(`¿Rechazar la solicitud de ${solicitud.nombre}?`)) return;
    
    this.authService.rechazarSolicitud(solicitud._id).subscribe({
      next: () => {
        alert('Solicitud rechazada');
        this.loadSolicitudes();
      },
      error: (err) => alert(err.error?.error || 'Error al rechazar solicitud')
    });
  }

  // ==================== ASIGNAR REPORTES A TÉCNICOS ====================
  
  // Cargar reportes para asignar
  loadReportesParaAsignar() {
    this.reportService.getReportes().subscribe({
      next: (reportes) => {
        this.reportesParaAsignar = reportes.map((r: any) => ({
          ...r,
          clienteId: r.usuarioId
        })).filter((r: any) => 
          !r.tecnicoAsignado && r.estatus !== 'completado' && r.estatus !== 'cancelado'
        );
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar reportes:', err)
    });
  }

  // Asignar reporte a técnico
  asignarReporte(reporte: any) {
    if (!this.tecnicoSeleccionado) {
      alert('Selecciona un técnico');
      return;
    }
    
    const tecnico = this.tecnicos.find(t => t._id === this.tecnicoSeleccionado);
    if (!tecnico) return;

    if (!confirm(`¿Asignar este reporte a ${tecnico.nombre}?`)) return;

    this.reportService.asignarTecnico(
      reporte._id,
      tecnico._id,
      tecnico.nombre,
      reporte.clienteId
    ).subscribe({
      next: () => {
        alert('Reporte asignado y enviado al técnico');
        this.reporteSeleccionado = null;
        this.tecnicoSeleccionado = '';
        this.loadReportesParaAsignar();
      },
      error: (err) => alert(err.error?.error || 'Error al asignar reporte')
    });
  }

  // Enviar reporte a técnico
  enviarReporteATecnico(reporte: any) {
    if (!reporte.tecnicoAsignado) {
      alert('El reporte no tiene técnico asignado');
      return;
    }
    
    if (!confirm(`¿Enviar reporte a ${reporte.tecnicoNombre}?`)) return;

    this.reportService.updateReporte(reporte._id, {
      enviadoATecnico: true,
      clienteId: reporte.usuarioId
    }).subscribe({
      next: () => {
        alert('Reporte enviado al técnico');
        this.loadReportesParaAsignar();
      },
      error: (err) => alert(err.error?.error || 'Error al enviar reporte')
    });
  }

  // Editar cliente
  editarCliente(cliente: any) {
    const nuevoNombre = prompt('Nombre:', cliente.nombre);
    const nuevoTelefono = prompt('Teléfono:', cliente.telefono);
    const nuevaLocalidad = prompt('Localidad:', cliente.localidad);
    const nuevaDireccion = prompt('Dirección:', cliente.direccion);
    const nuevoEstatus = prompt('Estatus (Activo/Suspendido):', cliente.estatus);

    if (nuevoNombre === null || nuevoTelefono === null) return;

    this.userService.updateUser(cliente._id, {
      nombre: nuevoNombre,
      telefono: nuevoTelefono,
      localidad: nuevaLocalidad,
      direccion: nuevaDireccion,
      estatus: nuevoEstatus
    }).subscribe({
      next: () => {
        alert('Cliente actualizado');
        this.loadData();
        this.buscar();
      },
      error: (err) => alert(err.error?.error || 'Error al actualizar cliente')
    });
  }

  // ==================== PRE-REGISTROS ====================
  
  loadPreregistros() {
    this.preregistroService.getPreregistros().subscribe({
      next: (preregistros) => {
        this.preregistros = preregistros;
        this.preregistrosPendientes = preregistros.filter((p: any) => p.estado === 'pendiente').length;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar pre-registros:', err)
    });
  }

  aprobarPreregistro(preregistro: any) {
    if (!confirm(`¿Aprobar el pre-registro de ${preregistro.nombre}?`)) return;

    this.preregistroService.aprobarPreregistro(preregistro._id, {}).subscribe({
      next: (res) => {
        alert(`Pre-registro aprobado.\nContrato: ${res.usuario.numero}\nPassword: ${res.usuario.passwordTemporal}`);
        this.loadPreregistros();
        this.loadData();
      },
      error: (err) => alert(err.error?.error || 'Error al aprobar pre-registro')
    });
  }

  rechazarPreregistro(preregistro: any) {
    if (!confirm(`¿Rechazar el pre-registro de ${preregistro.nombre}?`)) return;

    this.preregistroService.rechazarPreregistro(preregistro._id, {}).subscribe({
      next: () => {
        alert('Pre-registro rechazado');
        this.loadPreregistros();
      },
      error: (err) => alert(err.error?.error || 'Error al rechazar pre-registro')
    });
  }
}
