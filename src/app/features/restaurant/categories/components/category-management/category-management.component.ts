import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../../model/category.model';
import { CategoryService } from '../../services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule]
})
export class CategoryManagementComponent implements OnInit {
  @Input() restaurantId!: string;

  categories: Category[] = [];
  loading = true;

  constructor(private categoryService: CategoryService, private dialog: MatDialog) {}

  ngOnInit(): void {
    if (!this.restaurantId) throw new Error('restaurantId is required');
    this.categoryService.getCategories(this.restaurantId).subscribe((cats) => {
      this.categories = cats;
      this.loading = false;
    });
  }

addCategory() {
  const ref = this.dialog.open(CategoryDialogComponent, {
    width: '520px',
    data: {
      mode: 'create',
      restaurantId: this.restaurantId,
      categoryService: this.categoryService
    }
  });

  ref.afterClosed().subscribe(async payload => {
    if (!payload) return;
    await this.categoryService.createCategory({
      ...payload,
      restaurantId: this.restaurantId
    });
  });
}

editCategory(c: Category) {
  const ref = this.dialog.open(CategoryDialogComponent, {
    width: '520px',
    data: {
      mode: 'edit',
      category: c,
      restaurantId: this.restaurantId,
      categoryService: this.categoryService
    }
  });

  ref.afterClosed().subscribe(async payload => {
    if (!payload) return;
    await this.categoryService.updateCategory(
      this.restaurantId,
      c.categoryId!,
      payload
    );
  });
}

  async deleteCategory(c: Category) {
    const ok = confirm(`Eliminar categoría "${c.name}"?`);
    if (!ok) return;
    try {
      await this.categoryService.deleteCategory(this.restaurantId, c.categoryId!);
    } catch (e) {
      console.error(e);
    }
  }

  drop(event: CdkDragDrop<Category[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    // actualizar orden en backend
    const orderedIds = this.categories.map((c) => c.categoryId!) as string[];
    this.categoryService.reorderCategories(this.restaurantId, orderedIds).catch(console.error);
  }
}
