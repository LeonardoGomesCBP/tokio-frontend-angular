import { Routes } from '@angular/router';
import { authGuard, adminGuard } from '../../core/guards/auth.guard';
import { DashboardComponent } from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./overview/overview.component').then(c => c.OverviewComponent),
        title: 'Painel'
      },
      {
        path: 'users',
        loadChildren: () => import('../users/users.routes').then(m => m.USERS_ROUTES),
        canActivate: [adminGuard],
        title: 'Usuários'
      },
      {
        path: 'profile',
        loadComponent: () => import('../users/profile/profile.component').then(c => c.ProfileComponent),
        title: 'Meu Perfil'
      },
      {
        path: 'addresses',
        loadChildren: () => import('../addresses/addresses.routes').then(m => m.ADDRESSES_ROUTES),
        title: 'Meus Endereços'
      }
    ]
  }
]; 