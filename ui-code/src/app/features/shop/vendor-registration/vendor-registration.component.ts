import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { AdminService } from '../../../core/services/admin.service';
import { Category } from '../../../core/models/models';

@Component({
  selector: 'app-vendor-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vendor-registration.component.html'
})
export class VendorRegistrationComponent {
  registrationForm: FormGroup;
  isSubmitted = false;
  fileName = '';
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private router: Router,
    private adminService: AdminService
  ) {
    this.registrationForm = this.fb.group({
      storeName: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]]
    });
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getParentCategoriesHierarchy(0, 100).subscribe(response => {
      this.categories = response.content || [];
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
    }
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const formVal = this.registrationForm.value;
      this.vendorService.registerVendor({
        storeName: formVal.storeName,
        category: formVal.category,
        name: formVal.name,
        email: formVal.email,
        mobile: formVal.mobile
      }).subscribe(() => {
        this.isSubmitted = true;
        // Navigate or show success
        // this.router.navigate(['/admin']);
      });
    }
  }

  goToHome() {
    this.router.navigate(['/shop']);
  }
}
