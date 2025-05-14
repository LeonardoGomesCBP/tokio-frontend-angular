import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Auth Guard - isLoggedIn:', authService.isLoggedIn());
  console.log('Auth Guard - token:', authService.getToken());
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn() && authService.hasRole('ROLE_ADMIN')) {
    return true;
  }
  
  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
}; 