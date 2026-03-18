import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-data.service';
import { Vendor } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      catchError(error => {
        console.warn('Admin Stats API failed, falling back to mock data', error);
        return this.mockDataService.getAdminStats();
      })
    );
  }

  getPendingApprovals(status: string, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendors/approvals?status=${status}&page=${page}&size=${size}`).pipe(
      catchError(error => {
        console.warn('Admin Vendor Approvals API failed, falling back to mock data', error);
        return this.mockDataService.getPaginatedPendingVendors(status, page, size);
      })
    );
  }

  getVendorsFiltered(status: string): Observable<Vendor[]> {
    return this.http.post<Vendor[]>(`${this.apiUrl}/vendors/approvals`, { status }).pipe(
      catchError(error => {
        console.warn('Filtered Vendor List API failed, falling back to mock data', error);
        if (!status || status === 'All Statuses') {
          return this.mockDataService.getVendors();
        }
        return this.mockDataService.getVendors().pipe(
          map((vendors: Vendor[]) => vendors.filter((v: Vendor) => v.status === status))
        );
      })
    );
  }

  getVendorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendors/${id}`).pipe(
      catchError(error => {
        console.warn(`Admin Vendor ID ${id} API failed, falling back to mock data`, error);
        return this.mockDataService.getVendorById(id);
      })
    );
  }

  updateVendorStatus(id: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/vendors/${id}/status`, { status }).pipe(
      catchError(error => {
        console.warn('Update Vendor Status API failed, mock callback', error);
        if (status === 'Active') {
          this.mockDataService.verifyVendor(id);
        }
        return of(undefined);
      })
    );
  }

  // --- Category Management ---

  getCategories(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories?page=${page}&size=${size}&sort=id,desc`).pipe(
      catchError(error => {
        console.warn('Get Categories API failed, falling back to mock data', error);
        return this.mockDataService.getMockCategories();
      })
    );
  }

  getParentCategoriesHierarchy(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/parent-categories?page=${page}&size=${size}&sort=id,desc`).pipe(
      catchError(error => {
        console.warn('Get Category Hierarchy API failed, falling back to mock data', error);
        return this.mockDataService.getCategoryHierarchy();
      })
    );
  }

  createCategory(category: any, bannerImage?: File): Observable<any> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }), 'category.json');
    if (bannerImage) {
      formData.append('image', bannerImage);
    }

    return this.http.post<any>(`${this.apiUrl}/categories`, formData).pipe(
      catchError(error => {
        console.warn('Create Category API failed, mock returning the payload', error);
        return of({ ...category, id: Math.floor(Math.random() * 1000) });
      })
    );
  }

  updateCategory(id: number, category: any, bannerImage?: File): Observable<any> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }), 'category.json');
    if (bannerImage) {
      formData.append('image', bannerImage);
    }

    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, formData).pipe(
      catchError(error => {
        console.warn('Update Category API failed, mock returning the payload', error);
        return of({ ...category, id });
      })
    );
  }

}


