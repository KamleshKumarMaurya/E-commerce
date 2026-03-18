import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CartSidebarComponent } from '../../../features/shop/cart-sidebar/cart-sidebar.component';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header-footer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, CartSidebarComponent],
  templateUrl: './header-footer-layout.component.html'
})
export class HeaderFooterLayoutComponent implements OnInit, OnDestroy {
  showProfileMenu = signal(false);
  showCart = signal(false);
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(query: string) {
    this.searchSubject.next(query);
  }

  onSearch(query: string) {
    this.performSearch(query);
  }

  private performSearch(query: string) {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 3 || trimmedQuery.length === 0) {
      this.router.navigate(['/shop'], {
        queryParams: { search: trimmedQuery || null },
        queryParamsHandling: 'merge'
      });
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu.update(v => !v);
  }

  logout() {
    this.showProfileMenu.set(false);
    this.authService.logout();
  }
}
