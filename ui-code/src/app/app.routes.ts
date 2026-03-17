import { Routes } from '@angular/router';
import { SidebarLayoutComponent } from './shared/layouts/sidebar-layout/sidebar-layout.component';
import { HeaderFooterLayoutComponent } from './shared/layouts/header-footer-layout/header-footer-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { cartGuard } from './core/guards/cart.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    component: SidebarLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'admin' },
    children: [
      { path: 'vendor/:id', loadComponent: () => import('./features/admin/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent) },
      { path: 'vendors', loadComponent: () => import('./features/admin/vendor-list/vendor-list.component').then(m => m.VendorListComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/admin-category/admin-category.component').then(m => m.AdminCategoryComponent) },
      { path: '', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) }
    ]
  },
  {
    path: 'vendor',
    component: SidebarLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'vendor' },
    children: [
      { path: 'products', loadComponent: () => import('./features/vendor/product-management/product-management.component').then(m => m.ProductManagementComponent) },
      { path: '', loadComponent: () => import('./features/vendor/vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent) }
    ]
  },
  {
    path: 'shop',
    component: HeaderFooterLayoutComponent,
    children: [
      { path: 'product/:id', loadComponent: () => import('./features/shop/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'register-vendor', loadComponent: () => import('./features/shop/vendor-registration/vendor-registration.component').then(m => m.VendorRegistrationComponent) },
      { path: 'checkout', canActivate: [cartGuard], loadComponent: () => import('./features/shop/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'orders', canActivate: [authGuard], data: { role: 'customer' }, loadComponent: () => import('./features/shop/order-history/order-history.component').then(m => m.OrderHistoryComponent) },
      { path: '', loadComponent: () => import('./features/shop/product-list/product-list.component').then(m => m.ProductListComponent) }
    ]
  },
  {
    path: '',
    redirectTo: '/shop',
    pathMatch: 'full'
  }
];
