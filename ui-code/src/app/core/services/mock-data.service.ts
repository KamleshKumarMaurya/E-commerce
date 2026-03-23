import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Product, Vendor, Order, User, Category } from '../models/models';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private vendors$ = new BehaviorSubject<Vendor[]>([
    { id: '1', name: 'TechHaven Electronics', status: 'In Review', applications: 'Dec 12, 2023', verificationId: 'VID-8921', totalEarnings: 0, createdAt: new Date(), category: 'Electronics', email: 'vendor@example.com', storeName: 'TechHaven' },
    { id: '2', name: 'Gadget Store', status: 'Pending', applications: 'Dec 14, 2023', verificationId: 'VID-8925', totalEarnings: 0, createdAt: new Date(), category: 'Electronics', email: 'vendor@example.com', storeName: 'Gadget Store' },
    { id: '3', name: 'AudioHub', status: 'Verified', applications: 'Dec 01, 2023', verificationId: 'VID-8910', totalEarnings: 12000, createdAt: new Date(), category: 'Electronics', email: 'vendor@example.com', storeName: 'Jockey Store' },
    { id: '4', name: 'Smart Home Inc', status: 'Active', applications: 'Nov 20, 2023', verificationId: 'VID-8880', totalEarnings: 45000, createdAt: new Date(), category: 'Electronics', email: 'vendor@example.com', storeName: 'Smart Home Inc' }
  ]);

  private categories$ = new BehaviorSubject<Category[]>([
    {
      id: 1, name: 'Electronics', slug: 'electronics', description: 'Gadgets and gear', parentCategoryId: 0,
      bannerImageUrl: '', commissionPercentage: 10, isActive: true, displayOrder: 1,
      attributes: [
        { attributeName: 'Color', values: ['Midnight Black', 'Platinum Silver', 'Space Gray'] },
        { attributeName: 'Storage', values: ['128GB', '256GB', '512GB'] },
        { attributeName: 'RAM', values: ['8GB', '16GB', '32GB'] }
      ]
    },
    {
      id: 2, name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', parentCategoryId: 0,
      bannerImageUrl: '', commissionPercentage: 15, isActive: true, displayOrder: 2,
      attributes: [
        { attributeName: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
        { attributeName: 'Color', values: ['Crimson Red', 'Navy Blue', 'Forest Green', 'Classic White'] },
        { attributeName: 'Material', values: ['Organic Cotton', 'Polyester Blend', 'Silk', 'Linen'] }
      ]
    }
  ]);

  getAdminStats(): Observable<any> {
    return of({
      totalGmv: 4250000,
      activeVendors: 1240,
      totalOrders: 18500,
      growth: 15.2
    });
  }

  getVendorStats(): Observable<any> {
    return of({
      totalEarnings: 84500,
      activeListings: 45,
      lowStockAlerts: 3
    });
  }

  getVendors(): Observable<Vendor[]> {
    return this.vendors$.asObservable();
  }

  getVendorById(id: string): Observable<Vendor | undefined> {
    return this.vendors$.pipe(
      map(vendors => vendors.find(v => v.id === id))
    );
  }

  getPendingVendors(): Observable<Vendor[]> {
    return this.vendors$.pipe(
      map(vendors => vendors.filter(v => v.status === 'Pending' || v.status === 'In Review'))
    );
  }

  getPaginatedPendingVendors(status: string = '', page: number = 0, size: number = 5): Observable<any> {
    return this.vendors$.pipe(
      map(vendors => {
        let filtered = vendors.filter(v => v.status === 'Pending' || v.status === 'In Review');
        if (status && status !== 'All Statuses') {
          filtered = filtered.filter(v => v.status.toLowerCase() === status.toLowerCase());
        }
        const start = page * size;
        const end = start + size;
        return {
          content: filtered.slice(start, end),
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
          size: size,
          number: page
        };
      })
    );
  }

  getMockCategories(): Observable<any> {
    return this.categories$.pipe(
      map(categories => {
        const sorted = [...categories].sort((a, b) => (b.id || 0) - (a.id || 0));
        return {
          content: sorted,
          totalElements: sorted.length,
          totalPages: 1
        };
      })
    );
  }

  getCategoryHierarchy(): Observable<any> {
    const hierarchy = [
      {
        id: 7, name: 'Automotive', slug: 'automotive', attributes: [], childCategories: [
          {
            id: 8, name: 'Car Accessories', slug: 'car-accessories', attributes: [
              { attributeName: 'Wheel Size', values: ['12Inch', '24Inch'] },
              { attributeName: 'Color', values: ['Black', 'White', 'Red'] }
            ], childCategories: []
          }
        ]
      },
      {
        id: 1, name: 'Electronics', slug: 'electronics', attributes: [], childCategories: [
          { id: 101, name: 'Mobile Phones', slug: 'mobiles', attributes: [{ attributeName: 'Storage', values: ['128GB', '256GB'] }], childCategories: [] },
          { id: 102, name: 'Laptops', slug: 'laptops', attributes: [{ attributeName: 'RAM', values: ['8GB', '16GB'] }], childCategories: [] }
        ]
      },
      {
        id: 2, name: 'Fashion', slug: 'fashion', attributes: [], childCategories: [
          { id: 201, name: "Men's Wear", slug: 'mens-wear', attributes: [{ attributeName: 'Size', values: ['S', 'M', 'L'] }], childCategories: [] },
          { id: 202, name: "Women's Wear", slug: 'womens-wear', attributes: [{ attributeName: 'Size', values: ['S', 'M', 'L'] }], childCategories: [] }
        ]
      }
    ];
    return of({
      content: hierarchy,
      totalElements: hierarchy.length,
      totalPages: 1
    });
  }

  addVendor(vendorData: { name: string, category: string, verificationId: string }) {
    const currentVendors = this.vendors$.value;
    const newVendor: Vendor = {
      id: (currentVendors.length + 1).toString(),
      name: vendorData.name,
      status: 'Pending',
      applications: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      verificationId: vendorData.verificationId,
      totalEarnings: 0,
      createdAt: new Date(),
      category: vendorData.category,
      email: 'vendor@example.com',
      storeName: vendorData.name
    };
    this.vendors$.next([...currentVendors, newVendor]);
  }

  verifyVendor(vendorId: string) {
    const currentVendors = this.vendors$.value;
    const updatedVendors = currentVendors.map(v =>
      v.id === vendorId ? { ...v, status: 'Active' as const } : v
    );
    this.vendors$.next(updatedVendors);
  }

  private products$ = new BehaviorSubject<Product[]>([
    {
      id: 'automotive-1',
      vendorId: '7',
      name: 'Forged Carbon Fiber Alloy Wheels',
      sku: 'WHL-CF-20',
      price: 1250.00,
      basePrice: 1250.00,
      stock: 12,
      maxStock: 20,
      category: 'Automotive',
      images: [
        'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800&q=80',
        'https://images.unsplash.com/photo-1486006920555-c77dcf18193b?w=800&q=80'
      ],
      rating: 4.9,
      reviewsCount: 45,
      description: 'Ultra-lightweight forged carbon fiber wheels designed for track performance and street style. Exceptional strength-to-weight ratio.',
      specifications: {
        'Material': 'Forged Carbon Fiber',
        'Offset': 'ET35',
        'Bolt Pattern': '5x112',
        'Finish': 'Matte Carbon'
      },
      variants: [
        { id: 10, sku: 'WHL-18-MATTE', price: 1100, attributes: { 'Wheel Size': '12Inch', 'Color': 'Black' }, status: 'ACTIVE' },
        { id: 11, sku: 'WHL-20-GLOSS', price: 1250, attributes: { 'Wheel Size': '24Inch', 'Color': 'Red' }, status: 'ACTIVE' }
      ]
    },
    {
      id: 'electronics-1',
      vendorId: '1',
      name: 'Titanium Z-Phone Pro Max',
      sku: 'ZPH-PRO-512',
      price: 1199.00,
      basePrice: 1199.00,
      stock: 85,
      maxStock: 200,
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
      ],
      rating: 4.8,
      reviewsCount: 2560,
      description: 'The ultimate smartphone experience. Featuring a space-grade titanium frame, A18 Superchip, and a revolutionary 200MP camera system.',
      specifications: {
        'Processor': 'A18 Neural Bionic',
        'Screen': '6.8" OLED 120Hz',
        'Camera': '200MP + 48MP + 12MP',
        'Battery': '5000mAh'
      },
      variants: [
        { id: 20, sku: 'ZPH-128-BLK', price: 999, attributes: { 'Storage': '128GB', 'Color': 'Black' }, status: 'ACTIVE' },
        { id: 21, sku: 'ZPH-512-BLU', price: 1199, attributes: { 'Storage': '256GB', 'Color': 'White' }, status: 'ACTIVE' }
      ]
    },
    {
      id: 'fashion-1',
      vendorId: '2',
      name: 'Handcrafted Heritage Leather Jacket',
      sku: 'LTH-JKT-01',
      price: 450.00,
      basePrice: 450.00,
      stock: 30,
      maxStock: 50,
      category: 'Fashion',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
        'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80'
      ],
      rating: 4.9,
      reviewsCount: 320,
      description: 'A timeless silhouette meticulously handcrafted from full-grain vegetable-tanned Italian leather. Gains character with every wear.',
      specifications: {
        'Leather Type': 'Full-Grain Italian Calfskin',
        'Lining': 'Silk-Cotton Blend',
        'Hardware': 'Antique Brass YKK',
        'Fit': 'Slim Fit'
      },
      variants: [
        { id: 30, sku: 'JKT-S-BRN', price: 450, attributes: { 'Size': 'S', 'Color': 'Brown' }, status: 'ACTIVE' },
        { id: 31, sku: 'JKT-M-BLK', price: 450, attributes: { 'Size': 'M', 'Color': 'Black' }, status: 'ACTIVE' }
      ]
    },
    {
      id: 'fashion-2',
      vendorId: '3',
      name: 'Urban Nomad Breathable Sneakers',
      sku: 'SNK-NOM-07',
      price: 125.00,
      basePrice: 125.00,
      stock: 120,
      maxStock: 300,
      category: 'Fashion',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c274f?w=800&q=80',
        'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&q=80'
      ],
      rating: 4.7,
      reviewsCount: 890,
      description: 'Revolutionary comfort for the modern commuter. Features responsive foam cushioning and a 3D-knit breathable upper.',
      specifications: {
        'Upper': 'Eco-Knit Polyester',
        'Sole': 'Responsive EVA Foam',
        'Weight': '240g',
        'Eco-Friendly': 'Recycled Materials'
      },
      variants: [
        { id: 40, sku: 'SNK-8-ORG', price: 125, attributes: { 'Size': 'M', 'Color': 'Red' }, status: 'ACTIVE' },
        { id: 41, sku: 'SNK-10-ORG', price: 125, attributes: { 'Size': 'L', 'Color': 'Red' }, status: 'ACTIVE' }
      ]
    }
  ]);

  getProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  getProductsByVendor(vendorId: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(p => p.vendorId === vendorId))
    );
  }

  getPaginatedProductsByVendor(vendorId: string, page: number = 0, size: number = 10): Observable<any> {
    return this.products$.pipe(
      map(products => {
        const vendorProducts = products.filter(p => p.vendorId === vendorId);
        const start = page * size;
        const end = start + size;
        return {
          content: vendorProducts.slice(start, end),
          totalElements: vendorProducts.length,
          totalPages: Math.ceil(vendorProducts.length / size),
          size: size,
          number: page
        };
      })
    );
  }

  getPaginatedProducts(page: number = 0, size: number = 10, category?: string, sort?: string, search?: string): Observable<any> {
    return this.products$.pipe(
      map(products => {
        let filtered = [...products];
        if (category) {
          filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (sort === 'id,desc') {
          filtered = filtered.sort((a, b) => b.id.localeCompare(a.id));
        }
        const start = page * size;
        const end = start + size;
        return {
          content: filtered.slice(start, end),
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
          size: size,
          number: page
        };
      })
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.products$.pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  addProduct(productData: Partial<Product>, vendorId: string = '1') {
    const currentProducts = this.products$.value;

    // Auto-generate SKU
    const prefix = productData.name?.substring(0, 3).toUpperCase() || 'PROD';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${randomNum}`;

    const newProduct: Product = {
      id: (currentProducts.length + 1).toString(),
      vendorId: vendorId,
      name: productData.name || 'New Product',
      sku: sku,
      price: productData.price || 0,
      stock: productData.stock || 0,
      maxStock: 100,
      category: productData.category || 'General',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'], // Default placeholder
      rating: 0,
      reviewsCount: 0,
      specifications: productData.specifications || {},
      description: 'Newly added product from vendor portal.'
    };

    this.products$.next([...currentProducts, newProduct]);
  }

  updateProduct(updatedProduct: Partial<Product>) {
    const currentProducts = this.products$.value;
    const index = currentProducts.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      const newProducts = [...currentProducts];
      newProducts[index] = { ...newProducts[index], ...updatedProduct } as Product;
      this.products$.next(newProducts);
    }
  }

  deleteProduct(id: string) {
    const currentProducts = this.products$.value;
    this.products$.next(currentProducts.filter(p => p.id !== id));
  }
}
