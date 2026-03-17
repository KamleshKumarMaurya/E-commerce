import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ColorService } from '../../../core/services/color.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart-sidebar.component.html'
})
export class CartSidebarComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private router: Router,
    private colorService: ColorService
  ) {}

  ngOnInit() {
    // Fetch names for all items in cart to populate cache
    this.cartService.items().forEach(item => {
      if (item.selectedColor && item.selectedColor.startsWith('#')) {
        this.colorService.fetchColorName(item.selectedColor).subscribe();
      }
    });
  }

  getUrl(url: string | undefined) {
    if (!url) return 'assets/images/placeholder.png';
    const fullUrl = environment.apiUrl;
    const baseUrl = fullUrl.replace("/api/v1", "");
    return baseUrl + url;
  }

  getColorCode(item: any): string | null {
    if (item.selectedColor && item.selectedColor.startsWith('#')) {
      return item.selectedColor;
    }
    return null;
  }

  getColorName(colorValue: string | undefined): string {
    if (!colorValue) return '';
    return this.colorService.getColorName(colorValue);
  }

  increment(key: string, qty: number) {
    this.cartService.updateQuantity(key, qty + 1);
  }

  decrement(key: string, qty: number) {
    this.cartService.updateQuantity(key, qty - 1);
  }

  remove(key: string) {
    this.cartService.removeItem(key);
  }

  checkout() {
    this.close.emit();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { role: 'customer', returnUrl: '/shop/checkout' }
      });
      return;
    }
    this.router.navigate(['/shop/checkout']);
  }
}
