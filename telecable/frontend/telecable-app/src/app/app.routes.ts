import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { LoginUser } from './pages/login-user/login-user';
import { LoginTechnicianComponent } from './pages/login-technician/login-technician';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { UserDashboard } from './pages/user-dashboard/user-dashboard';
import { TechnicianDashboardComponent } from './pages/technician-dashboard/technician-dashboard';
import { Reportes } from './pages/reportes/reportes';
import { RegistroPassword } from './pages/registro-password/registro-password';
import { PreregistroComponent } from './pages/preregistro/preregistro';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'login-user', component: LoginUser },
  { path: 'login-technician', component: LoginTechnicianComponent },
  { path: 'registro-password', component: RegistroPassword },
  { path: 'preregistro', component: PreregistroComponent },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'user-dashboard', component: UserDashboard },
  { path: 'technician-dashboard', component: TechnicianDashboardComponent },
  { path: 'reportes', component: Reportes },
  { path: '**', redirectTo: '' }
];