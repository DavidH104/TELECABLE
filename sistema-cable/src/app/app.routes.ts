import { Routes } from '@angular/router';

export const routes: Routes = [

  // 🔹 Páginas públicas
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.component')
        .then(m => m.RegistroComponent)
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
      import('./pages/recuperar-password/recuperar-password.component')
        .then(m => m.RecuperarPasswordComponent)
  },

  // 🔹 Cliente
  {
    path: 'cliente/home',
    loadComponent: () =>
      import('./cliente/home-cliente/home-cliente.component')
        .then(m => m.HomeClienteComponent)
  },
  {
    path: 'cliente/estado-cuenta',
    loadComponent: () =>
      import('./cliente/estado-cuenta/estado-cuenta.component')
        .then(m => m.EstadoCuentaComponent)
  },

  // 🔹 Admin
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./admin/dashboard-admin/dashboard-admin.component')
        .then(m => m.DashboardAdminComponent)
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

