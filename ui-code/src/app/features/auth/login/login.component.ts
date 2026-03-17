import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email = '';
  role: 'admin' | 'vendor' | 'customer' = 'customer';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const paramRole = params['role'];
      if (paramRole === 'admin' || paramRole === 'vendor' || paramRole === 'customer') {
        this.role = paramRole;
      }
    });
  }

  onLogin() {
    if (this.email) {
      this.authService.login(this.email, this.role);
    }
  }
}
