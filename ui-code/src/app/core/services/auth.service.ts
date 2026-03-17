import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Current user signal
  private currentUser = signal<User | null>(null);

  // Derived signals for easy access
  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isVendor = computed(() => this.currentUser()?.role === 'vendor');

  constructor(private router: Router) {
    // Load user from storage on init
    const savedUser = localStorage.getItem('marketHub_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('marketHub_user');
      }
    }
  }

  login(email: string, role: 'admin' | 'vendor' | 'customer') {
    // Mock user creation based on selection
    const mockUser: User = {
      id: role == 'admin' ? '1' : role == 'vendor' ? '2' : '3',
      name: email.split('@')[0],
      email: email,
      role: role
    };

    this.currentUser.set(mockUser);
    localStorage.setItem('marketHub_user', JSON.stringify(mockUser));

    // Role-based redirection
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'vendor') {
      this.router.navigate(['/vendor']);
    } else {
      this.router.navigate(['/shop']);
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('marketHub_user');
    this.router.navigate(['/shop']);
  }
}
