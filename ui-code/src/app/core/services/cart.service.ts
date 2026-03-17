import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models/models';

const CART_KEY = 'elitecommerce_cart';

@Injectable({ providedIn: 'root' })
export class CartService {

  private _items = signal<CartItem[]>(this.loadFromStorage());

  // Public read-only signal
  items = this._items.asReadonly();

  // Total number of individual units across all items
  totalCount = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));

  // Grand total price
  total = computed(() => this._items().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));

  // ---------- Mutations ----------

  addItem(product: Product, quantity = 1, selectedSize?: string, selectedColor?: string, unitPrice?: number) {
    const key = `${product.id}_${selectedSize || 'default'}_${selectedColor || 'default'}`;
    const price = unitPrice ?? (selectedSize ? this.resolvePrice(product, selectedSize) : (product.basePrice ?? product.price ?? 0));

    this._items.update(items => {
      const existing = items.find(i => i.key === key);
      if (existing) {
        return items.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...items, { key, product, quantity, selectedSize, selectedColor, unitPrice: price }];
    });
    this.persist();
  }

  removeItem(key: string) {
    this._items.update(items => items.filter(i => i.key !== key));
    this.persist();
  }

  updateQuantity(key: string, quantity: number) {
    if (quantity <= 0) { this.removeItem(key); return; }
    this._items.update(items => items.map(i => i.key === key ? { ...i, quantity } : i));
    this.persist();
  }

  clearCart() {
    this._items.set([]);
    localStorage.removeItem(CART_KEY);
  }

  // ---------- Helpers ----------

  private resolvePrice(product: Product, size: string): number {
    const sizeIndex = product.sizes?.indexOf(size) ?? -1;
    if (sizeIndex < 0) return product.price;
    // L, XL, XXL carry a 10% premium
    const premium = ['L', 'XL', 'XXL'].includes(size) ? 1.1 : 1;
    return Math.round((product.basePrice ?? product.price) * premium);
  }

  private persist() {
    localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
