// src/app/features/restaurant/categories/components/category-dialog/category-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Category } from '../../model/category.model';
import { IconPickerComponent } from '../../../../../shared/components/icon-picker/icon-picker/icon-picker.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, IconPickerComponent],
})
export class CategoryDialogComponent {
  form: FormGroup;
  mode: 'create' | 'edit';
  constructor(
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      mode: 'create' | 'edit';
      category?: Category;
      restaurantId: string;
    }
  ) {
    this.mode = data.mode;
    const c = data.category ?? { name: '', icon: null, color: '#000000' };

    this.form = new FormGroup({
      name: new FormControl(c.name, { validators: [Validators.required] }),
      icon: new FormControl(c.icon || null),
      color: new FormControl(c.color || '#000000'),
    });
  }

  async save() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.value.name.trim();

    // Validación de duplicado
    if (this.mode === 'create') {
      const exists = await this.categoryService.existsCategoryName(
        this.data.restaurantId,
        name
      );
      if (exists) {
        alert('Ya existe una categoría con ese nombre.');
        return;
      }
    }

    if (this.mode === 'edit' && this.data.category) {
      const exists = await this.categoryService.existsCategoryNameExcludingId(
        this.data.restaurantId,
        name,
        this.data.category.categoryId!
      );
      if (exists) {
        alert('Ya existe una categoría con ese nombre.');
        return;
      }
    }

    this.dialogRef.close(this.form.value);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
