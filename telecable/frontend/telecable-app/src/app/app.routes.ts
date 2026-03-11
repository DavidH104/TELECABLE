import { Routes } from '@angular/router';

export const routes: Routes = [

{
path: '',
loadComponent: () => import('./pages/login/login').then(m => m.Login)
},

{
path: 'admin',
loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
},

{
path: 'usuario',
loadComponent: () => import('./pages/user-dashboard/user-dashboard').then(m => m.UserDashboard)
}

];