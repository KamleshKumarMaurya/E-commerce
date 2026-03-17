import { Injectable } from '@angular/core';
import { PlacedOrder, PlacedOrderItem, CartItem, Address, OrderStatus } from '../models/models';

const ORDERS_KEY = 'elitecommerce_orders';

@Injectable({ providedIn: 'root' })
export class OrderService {

  /** Place a new order and persist to localStorage */
  placeOrder(params: {
    customerId: string;
    customerEmail: string;
    cartItems: CartItem[];
    deliveryAddress: Address;
    paymentMethod: string;
    totalAmount: number;
  }): PlacedOrder {
    const orderId = 'ELC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const placedAt = new Date().toISOString();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const items: PlacedOrderItem[] = params.cartItems.map(ci => ({
      productId: ci.product.id,
      productName: ci.product.name,
      imageUrl: ci.product.imageUrl || ci.product.images?.[0],
      selectedSize: ci.selectedSize,
      selectedColor: ci.selectedColor,
      quantity: ci.quantity,
      unitPrice: ci.unitPrice,
      lineTotal: ci.unitPrice * ci.quantity
    }));

    const order: PlacedOrder = {
      orderId,
      customerId: params.customerId,
      customerEmail: params.customerEmail,
      placedAt,
      items,
      deliveryAddress: params.deliveryAddress,
      paymentMethod: params.paymentMethod,
      totalAmount: params.totalAmount,
      status: 'Order Placed',
      estimatedDelivery: deliveryDate.toISOString()
    };

    this.saveOrder(order);
    return order;
  }

  /** Get all orders for a specific customer */
  getOrdersByCustomer(customerId: string): PlacedOrder[] {
    const all = this.loadAll();
    return all
      .filter(o => o.customerId === customerId)
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }

  /** Get a single order by ID */
  getOrderById(orderId: string): PlacedOrder | undefined {
    return this.loadAll().find(o => o.orderId === orderId);
  }

  // ---------- Private helpers ----------

  private saveOrder(order: PlacedOrder) {
    const all = this.loadAll();
    all.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  }

  private loadAll(): PlacedOrder[] {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
