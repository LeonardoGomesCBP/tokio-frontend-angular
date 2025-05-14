import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/auth.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/user-list.component').then(c => c.UserListComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'new',
    loadComponent: () => import('./form/user-form.component').then(c => c.UserFormComponent),
    canActivate: [adminGuard],
    title: 'Novo Usuário'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/user-form.component').then(c => c.UserFormComponent),
    canActivate: [adminGuard],
    title: 'Editar Usuário',
    data: {
      renderMode: 'client'
    }
  },
  {
    path: ':id/addresses',
    loadComponent: () => import('../addresses/user-addresses/user-addresses.component').then(c => c.UserAddressesComponent),
    canActivate: [adminGuard],
    title: 'Endereços do Usuário'
  },
  {
    path: ':id/addresses/new',
    loadComponent: () => import('../addresses/user-address-form/user-address-form.component').then(c => c.UserAddressFormComponent),
    canActivate: [adminGuard],
    title: 'Novo Endereço do Usuário',
    data: {
      renderMode: 'client'
    }
  },
  {
    path: ':id/addresses/:addressId/edit',
    loadComponent: () => import('../addresses/user-address-form/user-address-form.component').then(c => c.UserAddressFormComponent),
    canActivate: [adminGuard],
    title: 'Editar Endereço do Usuário',
    data: {
      renderMode: 'client'
    }
  }
]; 