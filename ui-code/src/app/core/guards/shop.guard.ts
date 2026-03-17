import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Allows any user onto the Shop, BUT if a logged-in Vendor or Admin
 * navigates here they are redirected to their own dashboard.
 * Customers (and unauthenticated visitors) pass through freely.
 */
export const shopGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();

  if (user?.role === 'vendor') {
    router.navigate(['/vendor']);
    return false;
  }

  if (user?.role === 'admin') {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
