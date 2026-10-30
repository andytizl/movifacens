import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
      { path: 'oferecer', loadComponent: () => import('./pages/oferecer-carona/oferecer-carona').then(m => m.OferecerCarona) },
      { path: 'buscar', loadComponent: () => import('./pages/buscar-carona/buscar-carona').then(m => m.BuscarCarona) },
      { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil) },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  { path: '**', redirectTo: '' },
];