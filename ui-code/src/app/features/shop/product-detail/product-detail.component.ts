import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { VendorService } from '../../../core/services/vendor.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ColorService } from '../../../core/services/color.service';
import { Product, Vendor } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | undefined>(undefined);
  vendor = signal<Vendor | undefined>(undefined);
  selectedImageIndex = signal(0);
  quantity = signal(1);
  selectedColor = signal('Dark Blue');
  selectedSize = signal('M');
  showSizeChart = signal(false);
  activeTab = signal<'description' | 'specifications' | 'shipping'>('description');
  expandedSections = signal<Set<string>>(new Set(['specifications']));
  cartAdded = signal(false);   // brief success flash
  Math = Math;

  currentImageUrl = computed(() => {
    const prod = this.product();
    if (!prod) return 'assets/images/placeholder.png';

    const index = this.selectedImageIndex();
    if (index === -1) return this.getUrl(prod.imageUrl);

    if (prod.images && prod.images[index]) {
      return prod.images[index];
    }

    return this.getUrl(prod.imageUrl);
  });

  sizeChartData = [
    { brandSize: 'S', standardSize: 'S', chest: 37, length: 26 },
    { brandSize: 'M', standardSize: 'M', chest: 39, length: 28 },
    { brandSize: 'L', standardSize: 'L', chest: 41, length: 29 },
    { brandSize: 'XL', standardSize: 'XL', chest: 43, length: 30 },
    { brandSize: 'XXL', standardSize: 'XXL', chest: 45, length: 31 }
  ];

  offers = [
    { title: 'Bank Offer', desc: '10% Instant Discount on HDFC Bank Cards', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { title: 'Flat ₹500 Off', desc: 'Use code ELITE500 on your first purchase', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { title: 'Free Shipping', desc: 'Complimentary shipping on premium orders', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' }
  ];

  selectedAttributes = signal<{ [key: string]: string }>({});

  // Extract unique attributes from variants
  variantAttributeKeys = computed(() => {
    const prod = this.product();
    if (!prod || !prod.variants) return [];

    const keys = new Set<string>();
    prod.variants.forEach(v => {
      Object.keys(v.attributes || {}).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  });

  getOptionsForAttribute(key: string) {
    const prod = this.product();
    if (!prod || !prod.variants) return [];

    const options = new Set<string>();
    prod.variants.forEach(v => {
      if (v.attributes && v.attributes[key]) {
        options.add(v.attributes[key]);
      }
    });
    return Array.from(options);
  }

  // Find variant matching current selection
  selectedVariant = computed(() => {
    const prod = this.product();
    const selection = this.selectedAttributes();
    if (!prod || !prod.variants || Object.keys(selection).length === 0) return null;

    return prod.variants.find(v => {
      return Object.entries(selection).every(([key, value]) => v.attributes[key] === value);
    }) || null;
  });

  // Dynamic price calculation
  displayPrice = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.price;

    const prod = this.product();
    return prod?.price || prod?.basePrice || 0;
  });

  displayBasePrice = computed(() => {
    const prod = this.product();
    return prod?.basePrice || 0;
  });

  discountPercentage = computed(() => {
    const currentPrice = this.displayPrice();
    const basePrice = this.displayBasePrice();

    if (!basePrice || basePrice <= currentPrice) return 0;

    return Math.round(((basePrice - currentPrice) / basePrice) * 100);
  });

  getColorCode(colorValue: string): string | null {
    if (colorValue && colorValue.startsWith('#')) {
      return colorValue;
    }
    return null;
  }

  getColorName(colorValue: string): string {
    return this.colorService.getColorName(colorValue);
  }

  isOptionAvailable(key: string, value: string): boolean {
    const prod = this.product();
    if (!prod || !prod.variants || prod.variants.length === 0) return true;

    const currentSelection = this.selectedAttributes();

    // Create a theoretical selection with the new value
    const theoreticalSelection = { ...currentSelection, [key]: value };

    // Check if any variant matches this theoretical selection
    return prod.variants.some(variant => {
      return Object.entries(theoreticalSelection).every(([k, val]) => {
        if (!val) return true;
        return variant.attributes[k] === val;
      });
    });
  }

  // Improved helper for individual option check
  isOptionCompatible(targetKey: string, targetValue: string): boolean {
    const prod = this.product();
    if (!prod || !prod.variants) return true;

    // A value is "compatible" if it exists in ANY valid variant for this product
    // This ensures the button is always clickable if it's a valid choice for the product
    return prod.variants.some(v => v.attributes[targetKey] === targetValue);
  }

  getUrl(url: string | undefined) {
    if (!url) return 'assets/images/placeholder.png';
    const fullUrl = environment.apiUrl;
    const baseUrl = fullUrl.replace("/api/v1", "");
    return baseUrl + url;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private vendorService: VendorService,
    private cartService: CartService,
    private authService: AuthService,
    private colorService: ColorService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.productService.getProductById(productId).subscribe(product => {
          this.product.set(product);
          // Reset selected states on product change
          this.selectedImageIndex.set(-1); // Default to main image
          this.quantity.set(1);

          // Auto-select first available options if any
          if (product?.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            this.selectedAttributes.set({ ...firstVariant.attributes });
          }

          // Fetch names for all color variants to populate cache
          product?.variants?.forEach(v => {
            const color = v.attributes?.['Color'] || v.attributes?.['color'];
            if (color && color.startsWith('#')) {
              this.colorService.fetchColorName(color).subscribe();
            }
          });

          // Fetch vendor details
          if (product?.vendorId) {
            this.vendorService.getVendorById(product.vendorId).subscribe(v => {
              this.vendor.set(v);
            });
          }
        });
      }
    });
  }

  selectAttribute(key: string, value: string) {
    this.selectedAttributes.update(attrs => {
      const newSelection = { ...attrs, [key]: value };
      const prod = this.product();
      if (!prod || !prod.variants || prod.variants.length === 0) return newSelection;

      // 1. Check if the exact new selection is valid
      const exactMatch = prod.variants.find(v => 
        Object.entries(newSelection).every(([k, val]) => v.attributes[k] === val)
      );
      if (exactMatch) return newSelection;

      // 2. If not, auto-resolve to the "best" valid variant that includes our new selection
      // We prioritize variants matching the new value, then those matching the most previous selections
      const bestVariant = prod.variants
        .filter(v => v.attributes[key] === value)
        .sort((a, b) => {
          const aMatches = Object.entries(attrs).filter(([k, v]) => k !== key && a.attributes[k] === v).length;
          const bMatches = Object.entries(attrs).filter(([k, v]) => k !== key && b.attributes[k] === v).length;
          return bMatches - aMatches;
        })[0];

      if (bestVariant) {
        return { ...bestVariant.attributes };
      }

      return newSelection;
    });
  }

  incrementQuantity() {
    const currentProduct = this.product();
    const stock = currentProduct?.stockQuantity ?? currentProduct?.stock ?? 0;
    if (currentProduct && this.quantity() < stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  toggleSection(section: string) {
    this.expandedSections.update(set => {
      const newSet = new Set(set);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }

  addToCart() {
    const prod = this.product();
    if (!prod) return;

    // If not logged in, redirect to login with return URL
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { role: 'customer', returnUrl: this.router.url }
      });
      return;
    }

    const selection = this.selectedAttributes();
    const size = selection['Size'] || selection['size'];
    const color = selection['Color'] || selection['color'];

    this.cartService.addItem(
      prod,
      this.quantity(),
      size,
      color,
      this.displayPrice()
    );

    // Flash success for 2 seconds
    this.cartAdded.set(true);
    setTimeout(() => this.cartAdded.set(false), 2000);
  }
}
