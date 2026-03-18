import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Product } from '../models/models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-data.service';

export interface PaginatedProducts {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  getProducts(page: number = 0, size: number = 10, category?: string, sort?: string, search?: string): Observable<PaginatedProducts> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (category) {
      params = params.set('category', category);
    }
    if (sort) {
      params = params.set('sort', sort);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PaginatedProducts>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.warn('Product API failed, falling back to mock data', error);
        return this.mockDataService.getPaginatedProducts(page, size, category, sort, search);
      })
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.warn(`Product ID ${id} API failed, falling back to mock data`, error);
        return this.mockDataService.getProductById(id) as Observable<Product>;
      })
    );
  }
}
