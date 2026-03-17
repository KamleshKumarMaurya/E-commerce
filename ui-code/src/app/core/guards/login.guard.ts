import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Prevents access to the Login page if the user is already logged in.
 * Redirects each role to their appropriate home:
 *  - Admin   → /admin
 *  - Vendor  → /vendor
 *  - Customer → /shop
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return true;

  const role = authService.user()?.role;
  if (role === 'admin') router.navigate(['/admin']);
  else if (role === 'vendor') router.navigate(['/vendor']);
  else router.navigate(['/shop']);

  return false;
};
