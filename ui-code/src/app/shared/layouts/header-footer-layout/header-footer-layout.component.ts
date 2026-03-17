import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CartSidebarComponent } from '../../../features/shop/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-header-footer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, CartSidebarComponent],
  templateUrl: './header-footer-layout.component.html'
})
export class HeaderFooterLayoutComponent {
  showProfileMenu = signal(false);
  showCart = signal(false);

  constructor(
    public authService: AuthService,
    public cartService: CartService
  ) {}

  toggleProfileMenu() {
    this.showProfileMenu.update(v => !v);
  }

  logout() {
    this.showProfileMenu.set(false);
    this.authService.logout();
  }
}
