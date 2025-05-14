import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ADDRESSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/address-list.component').then(c => c.AddressListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'new',
    loadComponent: () => import('./form/address-form.component').then(c => c.AddressFormComponent),
    canActivate: [authGuard],
    title: 'Novo Endereço'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/address-form.component').then(c => c.AddressFormComponent),
    canActivate: [authGuard],
    title: 'Edit Address'
  }
]; 