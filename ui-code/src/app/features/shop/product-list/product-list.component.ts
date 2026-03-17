import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  totalElements = signal<number>(0);
  Math = Math;

  categories = [
    { name: 'Electronics', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', color: 'bg-blue-50 text-blue-600' },
    { name: 'Fashion', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-pink-50 text-pink-600' },
    { name: 'Home & Living', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'bg-orange-50 text-orange-600' },
    { name: 'Beauty', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-purple-50 text-purple-600' },
    { name: 'Sports', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Explore More', icon: 'M4 6h16M4 12h16m-7 6h7', color: 'bg-slate-50 text-slate-600' }
  ];

  constructor(private productService: ProductService) { }

  getUrl(url: string | undefined) {
    if (!url) return 'assets/images/placeholder.png';
    const fullUrl = environment.apiUrl;
    const baseUrl = fullUrl.replace("/api/v1", "");
    return baseUrl + url;
  }

  ngOnInit(): void {
    this.productService.getProducts(0, 12).subscribe(response => {
      this.products.set(response.content);
      this.totalElements.set(response.totalElements);
    });
  }
}
