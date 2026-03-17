import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { VendorService } from '../../../core/services/vendor.service';
import { Product, Category } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';
import { ProductModalComponent } from '../components/product-modal/product-modal.component';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductModalComponent],
  templateUrl: './product-management.component.html'
})
export class ProductManagementComponent implements OnInit {
  vendorProducts: Product[] = [];
  categories: Category[] = [];

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  showAddModal = false;
  selectedProduct: Product | null = null;
  Math = Math;

  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private adminService: AdminService, private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories(0, 100).subscribe(response => {
      this.categories = response.content || [];
    });
  }

  getUrl(url: string) {
    const fullUrl = environment.apiUrl;
    const baseUrl = fullUrl.replace("/api/v1", "");
    return baseUrl + url;
  }

  loadProducts(): void {
    if (this.authService.isAdmin()) {
      this.productService.getProducts(this.currentPage, this.pageSize).subscribe(response => {
        this.vendorProducts = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      });
    } else {
      this.vendorService.getProducts(this.currentPage, this.pageSize).subscribe(response => {
        this.vendorProducts = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      });
    }
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  openAddModal() {
    this.selectedProduct = null;
    this.showAddModal = true;
  }

  openEditModal(product: Product) {
    this.selectedProduct = product;
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.selectedProduct = null;
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.vendorService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  onSaveProduct(event: { productData: Partial<Product>, file?: File }) {
    if (this.selectedProduct && this.selectedProduct.id) {
      // Edit mode
      this.vendorService.updateProduct(this.selectedProduct.id, event.productData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeAddModal();
        },
        error: (err) => console.error('Failed to update product', err)
      });
    } else {
      // Create mode
      this.vendorService.addProduct(event.productData, event.file).subscribe({
        next: () => {
          this.loadProducts();
          this.closeAddModal();
        },
        error: (err) => console.error('Failed to add product', err)
      });
    }
  }
}
