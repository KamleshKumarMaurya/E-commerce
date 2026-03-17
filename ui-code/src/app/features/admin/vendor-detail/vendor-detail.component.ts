import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Vendor } from '../../../core/models/models';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-detail.component.html'
})
export class VendorDetailComponent implements OnInit {
  vendor?: Vendor;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    const vendorId = this.route.snapshot.paramMap.get('id');
    if (vendorId) {
      this.adminService.getVendorById(vendorId).subscribe(vendor => {
        this.vendor = vendor[0];
        console.log(this.vendor);
      });
    }
  }

  onVerify() {
    if (this.vendor) {
      this.adminService.updateVendorStatus(this.vendor.id, 'Active').subscribe(() => {
        // Refresh local state
        if (this.vendor) {
          this.adminService.getVendorById(this.vendor.id).subscribe(v => this.vendor = v);
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
