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

  loadVendors(): void {
    // Note: VendorListComponent might need its own VendorManagement service in real apps, 
    // but here we use AdminService for approvals/verify logic.
    const statusToSend = this.selectedStatus === 'All Statuses' ? '' : this.selectedStatus;
    this.adminService.getPendingApprovals(statusToSend).subscribe(data => this.vendors = data);
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
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
}
