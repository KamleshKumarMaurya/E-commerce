import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { PlacedOrder, OrderStatus, PlacedOrderItem } from '../../../core/models/models';
import { ColorService } from '../../../core/services/color.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-history.component.html'
})
export class OrderHistoryComponent implements OnInit {
  orders = signal<PlacedOrder[]>([]);
  selectedOrder = signal<PlacedOrder | null>(null);

  trackingSteps: OrderStatus[] = [
    'Order Placed',
    'Confirmed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private colorService: ColorService
  ) {}

  getUrl(url: string | undefined) {
    if (!url) return 'assets/images/placeholder.png';
    const fullUrl = environment.apiUrl;
    const baseUrl = fullUrl.replace("/api/v1", "");
    return baseUrl + url;
  }

  getColorCode(colorValue: string | undefined): string | null {
    if (colorValue && colorValue.startsWith('#')) {
      return colorValue;
    }
    return null;
  }

  getColorName(colorValue: string | undefined): string {
    if (!colorValue) return '';
    return this.colorService.getColorName(colorValue);
  }

  ngOnInit() {
    const userId = this.authService.user()?.id;
    if (userId) {
      const orders = this.orderService.getOrdersByCustomer(userId);
      this.orders.set(orders);

      // Fetch names for all colors in all orders to populate cache
      orders.forEach(order => {
        order.items.forEach((item: PlacedOrderItem) => {
          if (item.selectedColor && item.selectedColor.startsWith('#')) {
            this.colorService.fetchColorName(item.selectedColor).subscribe();
          }
        });
      });
    }
  }

  selectOrder(order: PlacedOrder) {
    this.selectedOrder.update(current => current?.orderId === order.orderId ? null : order);
  }

  trackingIndex(status: OrderStatus): number {
    return this.trackingSteps.indexOf(status);
  }

  isStepDone(orderStatus: OrderStatus, stepStatus: OrderStatus): boolean {
    return this.trackingSteps.indexOf(orderStatus) >= this.trackingSteps.indexOf(stepStatus);
  }

  isCurrentStep(orderStatus: OrderStatus, stepStatus: OrderStatus): boolean {
    return orderStatus === stepStatus;
  }

  statusColor(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      'Order Placed': 'bg-blue-50 text-blue-700 border-blue-200',
      'Confirmed': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Shipped': 'bg-amber-50 text-amber-700 border-amber-200',
      'Out for Delivery': 'bg-orange-50 text-orange-700 border-orange-200',
      'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return map[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  }
}
