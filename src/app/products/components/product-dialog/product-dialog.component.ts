import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../../model/product.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../features/restaurant/categories/services/category.service';
import { Category } from '../../../features/restaurant/categories/model/category.model';

export type ProductDialogMode = 'create' | 'edit';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.css'],
})
export class ProductDialogComponent implements OnInit {
  
  mode: ProductDialogMode;
  editForm: FormGroup;
  categories: Category[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      mode: ProductDialogMode;
      data?: Product;
      restaurantId: string;
    },
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.mode = data.mode;

    const p = data.data ?? {
      name: '',
      price: 0,
      available: true,
      description: '',
      imageUrl: '',
      categoryId: '',
      isOffer: false,
      offerPrice: null,
    };

    this.editForm = this.fb.group(
      {
        name: [p.name, [Validators.required, Validators.minLength(2)]],
        categoryId: [p.categoryId, Validators.required], 
        price: [p.price, [Validators.required, Validators.min(0)]],
        isOffer: [p.isOffer],
        offerPrice: [p.offerPrice, [Validators.min(0)]],
        description: [p.description],
        available: [p.available],
        imageUrl: [p.imageUrl],
      },
      { validators: [this.offerValidator] }
    );
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService
      .getCategories(this.data.restaurantId)
      .subscribe((cats) => (this.categories = cats));
  }

  offerValidator(form: AbstractControl): ValidationErrors | null {
    const isOffer = form.get('isOffer')?.value;
    const price = form.get('price')?.value;
    const offerPrice = form.get('offerPrice')?.value;

    if (!isOffer) return null;

    if (!offerPrice) return { offerRequired: true };

    if (offerPrice >= price) return { invalidOffer: true };

    return null;
  }

  saveProduct() {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;

    const formValue = this.editForm.value;

    const cleanedName =
      formValue.name.trim().charAt(0).toUpperCase() +
      formValue.name.trim().slice(1);

    const selectedCategory = this.categories.find(
      (c) => c.categoryId === formValue.categoryId
    );

    const finalProduct: Product = {
      ...(this.data.data ?? {}),
      ...formValue,
      name: cleanedName,
      offerPrice: formValue.isOffer ? formValue.offerPrice : null,
      restaurantId: this.data.restaurantId,
      categoryId: formValue.categoryId,
      categoryName: selectedCategory?.name ?? null, // denormalización opcional
    };

    this.dialogRef.close(finalProduct);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
