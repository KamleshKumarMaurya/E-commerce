import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { AdminService } from '../../../core/services/admin.service';
import { Vendor } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  stats: any;
  vendors: Vendor[] = [];

  // Chart configuration
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40, 70, 90, 105, 120, 115],
        label: 'Sales Growth ($)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 1)',
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(37, 99, 235, 1)',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      x: {},
      'y-axis-0': {
        position: 'left',
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public lineChartType: ChartType = 'line';
  selectedStatus: string = 'All Statuses';

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 5;
  totalElements: number = 0;
  totalPages: number = 0;
  Math = Math;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadData();
    this.loadVendors();
  }

  loadData(): void {
    this.adminService.getStats().subscribe(data => this.stats = data);
  }

  loadVendors(): void {
    const statusToSend = this.selectedStatus === 'All Statuses' ? '' : this.selectedStatus;
    this.adminService.getPendingApprovals(statusToSend, this.currentPage, this.pageSize).subscribe(data => {
      this.vendors = data || [];
      this.totalElements = data?.totalElements || 0;
      this.totalPages = data?.totalPages || 0;
    });
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
    this.currentPage = 0; // Reset to first page on filter change
    this.loadVendors();
  }

  onVerifyVendor(vendorId: string) {
    this.adminService.updateVendorStatus(vendorId, 'Active').subscribe(() => {
      this.loadData();
      this.loadVendors();
    });
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
