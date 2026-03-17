import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ColorService } from '../../../core/services/color.service';
import { Address, PlacedOrder } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

type Step = 'address' | 'review' | 'payment' | 'confirmation';
type PaymentMethod = 'cod' | 'card' | 'upi';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  card: 'Credit / Debit Card',
  upi: 'UPI'
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  ngOnInit() {
    this.cartService.items().forEach(item => {
      if (item.selectedColor && item.selectedColor.startsWith('#')) {
        this.colorService.fetchColorName(item.selectedColor).subscribe();
      }
    });
  }
  step = signal<Step>('address');
  paymentMethod = signal<PaymentMethod>('cod');

  placedOrder = signal<PlacedOrder | null>(null);

  address: Address = {
    fullName: '', phone: '', line1: '', line2: '',
    city: '', state: '', pincode: ''
  };

  card = { number: '', expiry: '', cvv: '', name: '' };
  upiId = '';

  steps: { key: Step; label: string }[] = [
    { key: 'address', label: 'Delivery' },
    { key: 'review', label: 'Review' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmation', label: 'Confirm' },
  ];

  stepIndex = computed(() => this.steps.findIndex(s => s.key === this.step()));

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private colorService: ColorService
  ) { }

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

  isAddressValid(): boolean {
    const a = this.address;
    return !!(a.fullName && a.phone && a.line1 && a.city && a.state && a.pincode);
  }

  proceedToReview() {
    if (this.isAddressValid()) this.step.set('review');
  }

  proceedToPayment() {
    this.step.set('payment');
  }

  placeOrder() {
    const user = this.authService.user();
    const paymentLabel = PAYMENT_LABELS[this.paymentMethod()];

    const order = this.orderService.placeOrder({
      customerId: user?.id ?? 'guest',
      customerEmail: user?.email ?? '',
      cartItems: this.cartService.items(),
      deliveryAddress: { ...this.address },
      paymentMethod: paymentLabel,
      totalAmount: this.cartService.total()
    });

    this.placedOrder.set(order);
    this.cartService.clearCart();
    this.step.set('confirmation');
  }

  viewOrders() {
    this.router.navigate(['/shop/orders']);
  }

  continueShopping() {
    this.router.navigate(['/shop']);
  }

  setPaymentMethod(key: string) {
    this.paymentMethod.set(key as PaymentMethod);
  }

  indianStates = [
    'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
    'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'
  ];
}
