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
    this.adminService.getPendingApprovals(statusToSend).subscribe(data => this.vendors = data);
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
    this.loadVendors();
  }

  onVerifyVendor(vendorId: string) {
    this.adminService.updateVendorStatus(vendorId, 'Active').subscribe(() => {
      this.loadData();
    });
  }
}
