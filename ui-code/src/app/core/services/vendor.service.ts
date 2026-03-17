import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Product } from '../models/models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/vendor`;

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const vendorId = this.authService.user()?.id || '1';
    return new HttpHeaders().set('X-Vendor-Id', vendorId);
  }

  getVendorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.warn(`Vendor ID ${id} API failed, falling back to mock data`, error);
        return this.mockDataService.getVendorById(id);
      })
    );
  }

  registerVendor(data: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, data).pipe(
      catchError(error => {
        console.warn('Vendor Registration API failed, mock callback', error);
        this.mockDataService.addVendor(data);
        return of(undefined);
      })
    );
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Vendor Analytics API failed, falling back to mock data', error);
        return this.mockDataService.getVendorStats();
      })
    );
  }

  getProducts(page: number = 0, size: number = 10): Observable<any> {
    const params = `?page=${page}&size=${size}`;
    return this.http.get<any>(`${this.apiUrl}/products${params}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Vendor Products API failed, falling back to mock data', error);
        return this.mockDataService.getPaginatedProductsByVendor(this.authService.user()?.id || '1', page, size);
      })
    );
  }

  addProduct(product: Partial<Product>, image?: File): Observable<Product> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }), 'product.json');

    if (image) {
      formData.append('image', image);
    }
    return this.http.post<Product>(`${this.apiUrl}/products`, formData, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Add Product API failed, mock callback', error);
        this.mockDataService.addProduct(product, this.authService.user()?.id || '1');
        return of(product as Product);
      })
    );
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Update Product API failed, mock callback', error);
        this.mockDataService.updateProduct({ ...product, id });
        return of(product as Product);
      })
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Delete Product API failed, mock callback', error);
        this.mockDataService.deleteProduct(id);
        return of(undefined);
      })
    );
  }
}
