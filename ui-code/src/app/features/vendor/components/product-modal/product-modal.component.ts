import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Product, Category, CategoryHierarchyDTO } from '../../../../core/models/models';
import { ColorService } from '../../../../core/services/color.service';
import { AdminService } from '../../../../core/services/admin.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-modal.component.html'
})
export class ProductModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Input() categories: Category[] = [];

  @Output() save = new EventEmitter<{ productData: Partial<Product>, file?: File }>();
  @Output() close = new EventEmitter<void>();

  productForm: FormGroup;
  selectedFile: File | null = null;
  isEditing = false;
  previewUrl = signal<string | null>(null);

  hierarchy: CategoryHierarchyDTO[] = [];
  subCategories: CategoryHierarchyDTO[] = [];
  selectedFinalCategory: CategoryHierarchyDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private colorService: ColorService,
    private adminService: AdminService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      parentCategory: ['', Validators.required],
      subCategory: ['', Validators.required],
      category: ['', Validators.required],
      sku: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      customFields: this.fb.array([]),
      variants: this.fb.array([])
    });
  }



  onColorCodeChange(vIndex: number, aIndex: number) {
    const attr = this.getVariantAttributes(vIndex).at(aIndex);
    const hex = attr.get('code')?.value;

    if (hex) {
      this.colorService.fetchColorName(hex).subscribe(name => {
        attr.get('value')?.setValue(name);
      });
    }
  }

  ngOnInit(): void {
    this.loadHierarchy();
  }

  loadHierarchy() {
    this.adminService.getParentCategoriesHierarchy(0, 50).subscribe(data => {
      this.hierarchy = data.content || [];
      // If we are editing, we might need to initialze subCategories
      if (this.isEditing) {
        this.initializeCategoryDropdowns();
      }
    });
  }

  onParentCategoryChange() {
    const parentId = this.productForm.get('parentCategory')?.value;
    const parent = this.hierarchy.find(h => h.id === Number(parentId));
    this.subCategories = parent?.childCategories || [];
    this.productForm.get('subCategory')?.setValue('');
    this.productForm.get('category')?.setValue('');
    this.selectedFinalCategory = null;
  }

  onSubCategoryChange() {
    const subId = this.productForm.get('subCategory')?.value;
    const sub = this.subCategories.find(s => s.id === Number(subId));
    if (sub) {
      this.productForm.get('category')?.setValue(sub.name);
      this.selectedFinalCategory = sub;
    } else {
      this.productForm.get('category')?.setValue('');
      this.selectedFinalCategory = null;
    }
  }

  private initializeCategoryDropdowns() {
    const categoryName = this.productForm.get('category')?.value;
    if (!categoryName) return;

    for (const parent of this.hierarchy) {
      const sub = parent.childCategories?.find(s => s.name === categoryName);
      if (sub) {
        this.productForm.get('parentCategory')?.setValue(parent.id);
        this.subCategories = parent.childCategories || [];
        this.productForm.get('subCategory')?.setValue(sub.id);
        this.selectedFinalCategory = sub;
        break;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.isEditing = true;
      this.patchForm(this.product);
      if (this.hierarchy.length > 0) {
        this.initializeCategoryDropdowns();
      }
    } else if (changes['isOpen'] && this.isOpen && !this.product) {
      this.isEditing = false;
      this.resetForm();
    }
  }

  private patchForm(product: Product) {
    this.productForm.patchValue({
      name: product.name,
      category: product.categoryName,
      sku: product.sku,
      price: product.basePrice,
      stock: product.stockQuantity,
      description: product.description,
    });

    // Set preview URL
    if (product.imageUrl) {
      const fullUrl = environment.apiUrl;
      const baseUrl = fullUrl.replace("/api/v1", "");
      this.previewUrl.set(baseUrl + product.imageUrl);
    } else if (product.image) {
      this.previewUrl.set(product.image);
    } else {
      this.previewUrl.set(null);
    }

    this.customFields.clear();
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([key, value]) => {
        this.customFields.push(this.fb.group({
          key: [key, Validators.required],
          value: [value, Validators.required]
        }));
      });
    }
    this.variants.clear();
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        const attributes = variant.attributes || {};
        const attrGroups = Object.entries(attributes)
          .filter(([key]) => !key.toLowerCase().endsWith('code'))
          .map(([key, value]) => {
            let code = '';
            let displayValue = value;

            // If it's a color attribute and value is hex, resolve name and set code
            if (key.toLowerCase() === 'color' && value.startsWith('#')) {
              code = value;
              displayValue = this.colorService.getColorName(value);
            }

            return this.fb.group({
              key: [key, Validators.required],
              value: [displayValue, Validators.required],
              code: [code]
            });
          });

        this.variants.push(this.fb.group({
          id: variant.id,
          sku: [variant.sku, Validators.required],
          price: [variant.price, [Validators.required, Validators.min(0)]],
          status: [variant.status || 'ACTIVE'],
          attributes: this.fb.array(attrGroups)
        }));
      });
    }
  }

  private resetForm() {
    this.productForm.reset({
      name: '',
      parentCategory: '',
      subCategory: '',
      category: '',
      sku: '',
      price: 0,
      stock: 0,
      description: ''
    });
    this.customFields.clear();
    this.variants.clear();
    this.selectedFile = null;
    this.previewUrl.set(null);
    this.subCategories = [];
    this.selectedFinalCategory = null;
  }

  get customFields() {
    return this.productForm.get('customFields') as FormArray;
  }

  get selectedCategoryAttributes(): any[] {
    return this.selectedFinalCategory?.attributes || [];
  }

  getSuggestedValues(attrKey: string): string[] {
    const attr = this.selectedCategoryAttributes.find(a => a.attributeName.toLowerCase() === attrKey.toLowerCase());
    return attr?.values || [];
  }

  addDetail() {
    this.customFields.push(this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  removeDetail(index: number) {
    this.customFields.removeAt(index);
  }

  get variants() {
    return this.productForm.get('variants') as FormArray;
  }

  getVariantAttributes(index: number) {
    return this.variants.at(index).get('attributes') as FormArray;
  }

  addVariant() {
    this.variants.push(this.fb.group({
      sku: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['ACTIVE'],
      attributes: this.fb.array([])
    }));
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  addVariantAttribute(variantIndex: number) {
    this.getVariantAttributes(variantIndex).push(this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
      code: ['']
    }));
  }

  addSuggestedAttribute(variantIndex: number, attr: any) {
    const existing = this.getVariantAttributes(variantIndex).controls.find(
      c => c.get('key')?.value?.toLowerCase() === attr.attributeName.toLowerCase()
    );

    if (!existing) {
      this.getVariantAttributes(variantIndex).push(this.fb.group({
        key: [attr.attributeName, Validators.required],
        value: ['', Validators.required],
        code: ['']
      }));
    }
  }

  removeVariantAttribute(variantIndex: number, attrIndex: number) {
    this.getVariantAttributes(variantIndex).removeAt(attrIndex);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create local preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formVal = this.productForm.value;
      const specifications: { [key: string]: string } = {};

      formVal.customFields.forEach((field: { key: string, value: string }) => {
        specifications[field.key] = field.value;
      });

      const productData: any = {
        name: formVal.name,
        category: formVal.category,
        // sku: formVal.sku,
        price: formVal.price,
        stock: formVal.stock,
        description: formVal.description,
        specifications: specifications
      };

      if (formVal.variants && formVal.variants.length > 0) {
        productData.variants = formVal.variants.map((v: any) => {
          const attributes: { [key: string]: string } = {};
          v.attributes.forEach((attr: any) => {
            const isColor = attr.key.toLowerCase() === 'color';
            // Save hex code if it's a color, otherwise save the text value
            attributes[attr.key] = (isColor && attr.code) ? attr.code : attr.value;
          });
          return {
            id: v.id,
            sku: v.sku,
            price: v.price,
            status: v.status,
            attributes: attributes
          };
        });
      }

      this.save.emit({
        productData,
        file: this.selectedFile || undefined
      });
    }
  }
}
