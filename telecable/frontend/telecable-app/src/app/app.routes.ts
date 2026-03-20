import { Routes } from '@angular/router';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { LoginUser } from './pages/login-user/login-user';
import { Login } from './pages/login/login';
import { Promos } from './pages/promos/promos';
import { RegistroPassword } from './pages/registro-password/registro-password';
import { Reportes } from './pages/reportes/reportes';
import { UserDashboard } from './pages/user-dashboard/user-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/promos', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'login-user', component: LoginUser },
  { path: 'registro-password', component: RegistroPassword },
  { path: 'promos', component: Promos },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'user-dashboard', component: UserDashboard },
  { path: 'reportes', component: Reportes }
];