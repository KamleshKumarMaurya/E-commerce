import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role Access Matrix:
 *  - Admin    → /admin, /vendor, /shop  (can see everything)
 *  - Vendor   → /vendor, /shop          (can manage store + browse shop)
 *  - Customer → /shop + /shop/orders    (browse + order history)
 */
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Not logged in → go to login
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data['role'] as string | undefined;
  const userRole = authService.user()?.role;

  // No specific role required → allow any authenticated user
  if (!expectedRole) return true;

  // Admin can access everything
  if (userRole === 'admin') return true;

  // User has the exact role required → allow
  if (userRole === expectedRole) return true;

  // Vendor can also access vendor routes
  if (userRole === 'vendor' && expectedRole === 'vendor') return true;

  // Wrong role → redirect to their home
  if (userRole === 'vendor') {
    router.navigate(['/vendor']);
  } else if (userRole === 'customer') {
    router.navigate(['/shop']);
  } else {
    router.navigate(['/shop']);
  }
  return false;
};

