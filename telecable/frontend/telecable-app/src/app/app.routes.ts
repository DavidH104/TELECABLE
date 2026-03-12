import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { LoginUser } from './pages/login-user/login-user';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { UserDashboard } from './pages/user-dashboard/user-dashboard';
import { Reportes } from './pages/reportes/reportes';
import { RegistroPassword } from './pages/registro-password/registro-password';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'login-user', component: LoginUser },
  { path: 'registro-password', component: RegistroPassword },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'user-dashboard', component: UserDashboard },
  { path: 'reportes', component: Reportes }
];