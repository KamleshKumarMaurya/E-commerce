import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Vendor } from '../../../core/models/models';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-list.component.html'
})
export class VendorListComponent implements OnInit {
  vendors: Vendor[] = [];

  constructor(
    private adminService: AdminService,
    private location: Location
  ) { }
  selectedStatus: string = 'All Statuses';
  ngOnInit(): void {
    this.loadVendors();
  }

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  loadVendors(): void {
    const statusToSend = this.selectedStatus === 'All Statuses' ? '' : this.selectedStatus;
    this.adminService.getPendingApprovals(statusToSend, this.currentPage, this.pageSize).subscribe(data => {
      this.vendors = data || [];
      this.totalElements = data?.totalElements || 0;
      this.totalPages = data?.totalPages || 0;
    });
  }

  Math = Math;

  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
    this.currentPage = 0;
    this.loadVendors();
  }

  onVerify(vendorId: string) {
    this.adminService.updateVendorStatus(vendorId, 'Active').subscribe(() => {
      this.loadVendors();
    });
  }

  goBack() {
    this.location.back();
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadVendors();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadVendors();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadVendors();
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
