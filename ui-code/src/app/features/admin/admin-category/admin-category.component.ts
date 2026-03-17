import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Category, CategoryHierarchyDTO } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-category.component.html'
})
export class AdminCategoryComponent implements OnInit {
  categories: Category[] = [];
  parentCategories: CategoryHierarchyDTO[] = [];
  flatCategories: { id: number, name: string }[] = [];
  displayCategories: (Category & { depth: number, hasChildren: boolean, isExpanded: boolean })[] = [];
  expandedIds: Set<number> = new Set();

  get availableParentCategories() {
    return this.flatCategories.filter(cat => cat.id !== this.editCategoryId);
  }

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  Math = Math;

  showAddModal = false;
  categoryForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      parentCategoryId: [null],
      iconUrl: [''],
      commissionPercentage: [0.00, [Validators.required, Validators.min(0)]],
      isActive: [false],
      displayOrder: [0, Validators.required],
      variantAttributes: this.fb.array([])
    });
  }

  getUrl(url: string) {
    const fullUrl = environment.apiUrl;
    const baseUrl = fullUrl.replace("/api/v1", "");
    return baseUrl + url;
  }
  ngOnInit(): void {
    this.loadCategories();
    this.loadHierarchy();
  }

  loadHierarchy(): void {
    this.adminService.getParentCategoriesHierarchy(0, 50).subscribe({
      next: (data) => {
        this.parentCategories = data.content || [];
        this.flatCategories = [];
        this.flattenHierarchy(this.parentCategories);
      },
      error: (err) => {
        console.error('Failed to load category hierarchy', err);
      }
    });
  }

  flattenHierarchy(items: CategoryHierarchyDTO[], depth: number = 0): void {
    items.forEach(item => {
      if (item.parentCategoryId == null) {
        this.flatCategories.push({
          id: item.id,
          name: item.name
        });
      }
      // this.flatCategories.push({
      //   id: item.id,
      //   name: '--'.repeat(depth) + ' ' + item.name
      // });
      // if (item.childCategories && item.childCategories.length > 0) {
      //   this.flattenHierarchy(item.childCategories, depth + 1);
      // }
    });
  }

  loadCategories(): void {
    this.adminService.getParentCategoriesHierarchy(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        const hierarchy = data.content || [];
        this.categories = hierarchy;
        this.refreshDisplayList();
        this.totalElements = data.totalElements || 0;
        this.totalPages = data.totalPages || 0;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  refreshDisplayList(): void {
    this.displayCategories = [];
    this.flattenCategoriesForList(this.categories);
  }

  flattenCategoriesForList(items: Category[], depth: number = 0): void {
    items.forEach(item => {
      const hasChildren = !!(item.childCategories && item.childCategories.length > 0);
      const isExpanded = item.id !== undefined && this.expandedIds.has(item.id);

      this.displayCategories.push({
        ...item,
        depth,
        hasChildren,
        isExpanded
      });

      if (hasChildren && isExpanded) {
        this.flattenCategoriesForList(item.childCategories!, depth + 1);
      }
    });
  }

  toggleCategory(cat: any): void {
    if (!cat.hasChildren) return;

    if (this.expandedIds.has(cat.id)) {
      this.expandedIds.delete(cat.id);
    } else {
      this.expandedIds.add(cat.id);
    }
    this.refreshDisplayList();
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCategories();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCategories();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  selectedBannerFile: File | null = null;
  existingBannerUrl: string | null = null;
  editCategoryId: number | null = null;

  openAddModal() {
    this.revokeExistingUrl();
    this.categoryForm.reset({
      parentCategoryId: null,
      commissionPercentage: 0.00,
      isActive: false,
      displayOrder: 0
    });
    this.variantAttributes.clear();
    this.selectedBannerFile = null;
    this.existingBannerUrl = null;
    this.editCategoryId = null;
    this.showAddModal = true;
  }

  openEditModal(category: Category) {
    this.revokeExistingUrl();
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentCategoryId: category.parentCategoryId,
      commissionPercentage: category.commissionPercentage,
      isActive: category.isActive,
      displayOrder: category.displayOrder
    });
    this.variantAttributes.clear();
    if (category.attributes) {
      category.attributes.forEach(attr => {
        const valuesArray = this.fb.array(attr.values.map(v => new FormControl(v, Validators.required)));
        this.variantAttributes.push(this.fb.group({
          name: [attr.attributeName, Validators.required],
          values: valuesArray
        }));
      });
    }
    this.selectedBannerFile = null;
    this.editCategoryId = category.id || null;
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.revokeExistingUrl();
    this.selectedBannerFile = null;
    this.editCategoryId = null;
    this.categoryForm.reset();
  }

  private revokeExistingUrl() {
    if (this.existingBannerUrl && this.existingBannerUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.existingBannerUrl);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedBannerFile = file;
    }
  }

  generateSlug() {
    // Helper to auto-generate slug from name if empty
    const nameVal = this.categoryForm.get('name')?.value;
    const slugControl = this.categoryForm.get('slug');
    if (nameVal && !slugControl?.value) {
      slugControl?.setValue(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }

  get variantAttributes() {
    return this.categoryForm.get('variantAttributes') as FormArray;
  }

  addVariantAttribute() {
    this.variantAttributes.push(this.fb.group({
      name: ['', Validators.required],
      values: this.fb.array([new FormControl('', Validators.required)])
    }));
  }

  addVariantValue(attrIndex: number) {
    this.getVariantValues(attrIndex).push(new FormControl('', Validators.required));
  }

  getVariantValues(attrIndex: number) {
    return this.variantAttributes.at(attrIndex).get('values') as FormArray;
  }

  removeVariantAttribute(index: number) {
    this.variantAttributes.removeAt(index);
  }

  removeVariantValue(attrIndex: number, valueIndex: number) {
    this.getVariantValues(attrIndex).removeAt(valueIndex);
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.isSaving = true;
      const categoryData = { ...this.categoryForm.value };

      // Map variantAttributes from form to attributes for model
      if (categoryData.variantAttributes) {
        categoryData.attributes = categoryData.variantAttributes.map((attr: any) => ({
          attributeName: attr.name,
          values: attr.values
        }));
        delete categoryData.variantAttributes;
      }

      // Remove bannerImageUrl from JSON since it's now sent as bannerImage file
      delete categoryData.bannerImageUrl;

      if (this.editCategoryId) {
        // Edit mode
        this.adminService.updateCategory(this.editCategoryId, categoryData, this.selectedBannerFile || undefined).subscribe({
          next: (res) => {
            this.isSaving = false;
            this.loadCategories(); // refresh list
            this.loadHierarchy(); // refresh hierarchy dropdown
            this.closeAddModal();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Failed to update category', err);
          }
        });
      } else {
        // Create mode
        this.adminService.createCategory(categoryData, this.selectedBannerFile || undefined).subscribe({
          next: (res) => {
            this.isSaving = false;
            this.loadCategories(); // refresh list
            this.loadHierarchy(); // refresh hierarchy dropdown
            this.closeAddModal();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Failed to create category', err);
          }
        });
      }
    }
  }
}

