import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { VendorService } from '../../../core/services/vendor.service';
import { Product, Category } from '../../../core/models/models';
import { AdminService } from '../../../core/services/admin.service';
import { ProductModalComponent } from '../components/product-modal/product-modal.component';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, ReactiveFormsModule, ProductModalComponent],
  templateUrl: './vendor-dashboard.component.html'
})
export class VendorDashboardComponent implements OnInit {
  stats: any;
  products: Product[] = [];
  categories: Category[] = [];

  // Pagination
  currentPage: number = 0;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPages: number = 0;

  // Bar chart implementation
  public barChartData: ChartConfiguration['data'] = {
    labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
    datasets: [
      {
        data: [15, 8, 24, 65, 110, 85, 125, 90],
        label: 'Sales ($)',
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        hoverBackgroundColor: 'rgba(29, 78, 216, 1)',
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  };

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 14 }
      }
    }
  };

  public barChartType: ChartType = 'bar';

  showAddModal = false;
  selectedProduct: Product | null = null;
  Math = Math;

  constructor(
    private vendorService: VendorService, private authService: AuthService,
    private adminService: AdminService, private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadCategories();
  }

  getUrl(url: string) {
    const fullUrl = environment.apiUrl;
    const baseUrl = fullUrl.replace("/api/v1", "");
    return baseUrl + url;
  }

  loadCategories() {
    this.adminService.getCategories(0, 100).subscribe(response => {
      this.categories = response.content || [];
    });
  }

  loadData() {
    this.vendorService.getAnalytics().subscribe(data => this.stats = data);
    this.loadProducts();
  }

  loadProducts() {
    if (this.authService.isAdmin()) {
      this.productService.getProducts(this.currentPage, this.pageSize).subscribe(response => {
        this.products = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      });
    } else {
      this.vendorService.getProducts(this.currentPage, this.pageSize).subscribe(response => {
        this.products = response.content;
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

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.vendorService.deleteProduct(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  closeAddModal() {
    this.showAddModal = false;
    this.selectedProduct = null;
  }

  onSaveProduct(event: { productData: Partial<Product>, file?: File }) {
    if (this.selectedProduct && this.selectedProduct.id) {
      // Edit mode
      this.vendorService.updateProduct(this.selectedProduct.id, event.productData).subscribe({
        next: () => {
          this.loadData();
          this.closeAddModal();
        },
        error: (err) => console.error('Failed to update product', err)
      });
    } else {
      // Create mode
      this.vendorService.addProduct(event.productData, event.file).subscribe({
        next: () => {
          this.loadData();
          this.closeAddModal();
        },
        error: (err) => console.error('Failed to add product', err)
      });
    }
  }
}
