# 📺 Documentación Completa del Proyecto TELECABLE

---

## 1. Información General del Proyecto

**Nombre:** TELECABLE - Sistema de Gestión de Clientes de Cable  
**Tipo:** Aplicación Web Full Stack  
**Tecnologías:**
- **Frontend:** Angular 17+ (con SSR)
- **Backend:** Node.js / Express
- **Base de Datos:** MongoDB
- **Puerto Backend:** 5000
- **Puerto Frontend:** 4200

---

## 2. Estructura del Proyecto

```
TELECABLE/
├── telecable/
│   ├── backend/                 # Servidor Node.js
│   │   ├── models/             # Modelos MongoDB
│   │   │   ├── admin.js        # Administradores
│   │   │   ├── config.js       # Configuración (paquetes, promociones)
│   │   │   ├── notification.js  # Notificaciones
│   │   │   ├── preregistro.js  # Pre-registros
│   │   │   ├── report.js       # Reportes de fallas
│   │   │   ├── technician.js   # Técnicos
│   │   │   └── user.js         # Clientes
│   │   ├── routes/             # Rutas API
│   │   │   ├── auth.js         # Autenticación
│   │   │   ├── config.js       # Configuración
│   │   │   ├── notifications.js
│   │   │   ├── preregistros.js # Pre-registros
│   │   │   ├── receipts.js     # Recibos
│   │   │   ├── reportes.js     # Reportes
│   │   │   ├── technicians.js  # Técnicos
│   │   │   └── users.js        # Usuarios
│   │   ├── services/
│   │   │   └── pdf.service.js  # Generación de PDFs
│   │   ├── server.js           # Servidor principal
│   │   └── package.json
│   │
│   └── frontend/
│       └── telecable-app/       # Angular app
│           └── src/
│               └── app/
│                   ├── components/
│                   │   ├── navbar/       # Barra de navegación
│                   │   └── search/       # Búsqueda
│                   ├── models/
│                   │   └── user.ts
│                   ├── pages/
│                   │   ├── admin-dashboard/   # Panel admin
│                   │   ├── home/              # Página principal
│                   │   ├── login/             # Login general
│                   │   ├── login-technician/  # Login técnico
│                   │   ├── login-user/        # Login usuario
│                   │   ├── preregistro/       # Pre-registro
│                   │   ├── registro-password/
│                   │   ├── reportes/
│                   │   ├── technician-dashboard/
│                   │   └── user-dashboard/
│                   └── services/
│                       ├── auth.service.ts
│                       ├── config.service.ts
│                       ├── notification.service.ts
│                       ├── preregistro.service.ts
│                       ├── report.service.ts
│                       ├── technician.service.ts
│                       └── user.service.ts
```

---

## 3. Modelos de Datos (MongoDB)

### 3.1 User (Clientes)
```javascript
{
  numero: String,          // Número de contrato (único)
  nombre: String,
  telefono: String,
  direccion: String,
  localidad: String,
  password: String,        // Hash bcrypt
  estatus: String,         // Activo, Suspendido, Inactivo
  deuda: Number,
  paquete: String,         // basico, estandar, premium, custom
  precioPaquete: Number,   // 200 (por defecto)
  fechaInstalacion: Date,
  historialPagos: [{
    mes: Number,           // 1-12
    año: Number,          // 2024, 2025, etc.
    monto: Number,
    fechaPago: Date,
    status: String,       // pagado, pendiente, atrasado
    fechaLimite: Date
  }],
  reportes: [{
    tipo: String,         // Falla, Instalacion, Retiro, Pago, Otro
    mensaje: String,
    fecha: Date,
    estatus: String,      // Pendiente, En Revision, Asignado, En Proceso, Completado
    prioridad: String,    // Baja, Normal, Alta, Urgente
    tecnicoAsignado: ObjectId,
    tecnicoNombre: String,
    notasTecnico: String,
    fechaCompletado: Date
  }],
  solicitudRegistro: {
    tipo: String,
    estado: String,       // pendiente, aprobado, rechazado
    fecha: Date
  }
}
```

### 3.2 Admin (Administradores)
```javascript
{
  usuario: String,         // Nombre de usuario
  password: String,        // Hash bcrypt
  nombre: String,
  rol: String,
  createdAt: Date
}
```

### 3.3 Technician (Técnicos)
```javascript
{
  username: String,
  password: String,
  nombre: String,
  telefono: String,
  email: String,
  especialidad: String,
  activo: Boolean,
  createdAt: Date
}
```

### 3.4 Config (Configuración del Sistema)
```javascript
{
  clave: String,           // 'system'
  paquetes: [{
    nombre: String,
    clave: String,
    precio: Number,
    velocidad: String,
    canales: Number,
    descripcion: String,
    activo: Boolean
  }],
  canales: [{
    nombre: String,
    numero: Number,
    categoria: String
  }],
  promociones: [{
    titulo: String,
    descripcion: String,
    descuento: Number,
    precioEspecial: Number,
    validoHasta: Date,
    activo: Boolean
  }],
  precioDefault: Number    // 200
}
```

---

## 4. Rutas API del Backend

### 4.1 Autenticación (`/api/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/admin` | Login administrador |
| POST | `/user` | Login usuario/cliente |
| POST | `/technician` | Login técnico |
| POST | `/solicitar-codigo` | Solicitar código verificación |
| POST | `/verificar-codigo` | Verificar código |
| POST | `/admin/crear` | Crear administrador |
| POST | `/solicitudes/crear` | Crear solicitud |

### 4.2 Usuarios (`/api/users`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos |
| GET | `/buscar/:query` | Buscar por contrato/nombre |
| GET | `/contrato/:contrato` | Buscar por número |
| GET | `/:id` | Obtener usuario por ID |
| GET | `/:id/historial` | Obtener historial de pagos |
| GET | `/:id/historial/:año` | Historial de año específico |
| POST | `/` | Crear usuario |
| PUT | `/:id` | Actualizar usuario |
| PUT | `/:id/datos` | Actualizar datos |
| PUT | `/:id/pago` | Registrar pago |
| DELETE | `/:id/pago/:index` | Eliminar pago |

### 4.3 Técnicos (`/api/technicians`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar técnicos |
| GET | `/:id` | Obtener técnico |
| POST | `/login` | Login técnico |
| POST | `/` | Crear técnico |
| PUT | `/:id` | Actualizar técnico |
| DELETE | `/:id` | Eliminar técnico |

### 4.4 Reportes (`/api/reportes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar reportes |
| GET | `/todos` | Todos los reportes |
| GET | `/asignados/:tecnicoId` | Reportes asignados |
| POST | `/` | Crear reporte |
| PUT | `/:id` | Actualizar reporte |

### 4.5 Configuración (`/api/config`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Obtener configuración |
| PUT | `/` | Actualizar configuración |
| PUT | `/paquete/:clave` | Actualizar paquete |
| POST | `/promociones` | Agregar promoción |

### 4.6 Pre-registros (`/api/preregistros`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar pre-registros |
| GET | `/pendientes` | Pre-registros pendientes |
| POST | `/` | Crear pre-registro |
| POST | `/:id/aprobar` | Aprobar y crear usuario |
| POST | `/:id/rechazar` | Rechazar |
| DELETE | `/:id` | Eliminar |

---

## 5. Funcionalidades del Sistema

### 5.1 Panel de Administración
- ✅ Lista de clientes con búsqueda
- ✅ Ver detalles de cliente
- ✅ Editar información del cliente
- ✅ Gestionar paquetes y precios
- ✅ Gestionar promociones
- ✅ Sistema de reportes de fallas
- ✅ Historial de pagos
- ✅ Registrar pagos
- ✅ Generar recibos en PDF
- ✅ Auto-actualización cada 30 segundos

### 5.2 Panel de Cliente (Usuario)
- ✅ Ver información de cuenta
- ✅ Ver historial de pagos
- ✅ Estado de cuenta
- ✅ Enviar reportes de fallas
- ✅ Auto-actualización cada 30 segundos

### 5.3 Panel de Técnico
- ✅ Lista de reportes asignados
- ✅ Todos los reportes disponibles
- ✅ Actualizar estatus de reporte
- ✅ Agregar notas técnicas
- ✅ Auto-actualización cada 30 segundos

### 5.4 Pre-registro
- ✅ Formulario de registro online
- ✅ Paquete: 55 canales - $180/mes
- ✅ Aprobación por administrador

---

## 6. Credenciales de Acceso

### Administrador
- **Usuario:** admin
- **Contraseña:** admin123

### Técnicos
- Se crean desde el panel de administración

### Clientes
- Se crean mediante pre-registro o directamente en el admin

---

## 7. Cómo Ejecutar el Proyecto

### Iniciar Backend
```bash
cd telecable/backend
node server.js
```
El servidor estará en: http://localhost:5000

### Iniciar Frontend
```bash
cd telecable/frontend/telecable-app
ng serve
```
La aplicación estará en: http://localhost:4200

---

## 8. Comandos Útiles

### Regenerar contrato de administrador
```bash
cd telecable/backend
node server.js
```
Se crea automáticamente si no existe.

### Actualizar paquete único (200 pesos - 55 canales)
```bash
cd telecable/backend
node actualizarPaquete.js
```

---

## 9. Problemas Conocidos y Soluciones

| Problema | Solución |
|----------|----------|
| Error NG0205 en consola | Actualizar a la última versión con ngOnDestroy |
| No se guardan pagos | Reiniciar backend después de actualizaciones |
| Error de conexión MongoDB | Verificar que MongoDB esté ejecutándose |

---

## 10. Historial de Cambios Recientes

### Cambios del 24 de marzo 2026:
1. Auto-refresh en todos los paneles (30 segundos)
2. Historial de pagos desde fecha de instalación
3. Botón de generar recibo en pagos
4. Compatibilidad año/ano corregido
5. Paquete guardado en pre-registro
6. Diseño del banner mejorado
7. Precio actualizado a $180

---

*Documentación generada el 24 de marzo de 2026*
*Proyecto TELECABLE - Sistema de Gestión de Clientes*
