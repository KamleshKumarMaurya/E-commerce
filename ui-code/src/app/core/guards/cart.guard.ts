import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

/**
 * Guards the checkout route:
 * - If cart is empty → redirect to shop
 * - If not logged in → save return URL and redirect to login
 */
export const cartGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const cartService = inject(CartService);
  const router = inject(Router);

  if (cartService.items().length === 0) {
    router.navigate(['/shop']);
    return false;
  }

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], {
      queryParams: { role: 'customer', returnUrl: '/shop/checkout' }
    });
    return false;
  }

  return true;
};
