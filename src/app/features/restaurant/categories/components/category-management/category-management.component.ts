import { Component, Input, OnInit, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Category } from '../../model/category.model';
import { CategoryService } from '../../services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { BaseColumn, BaseTableComponent } from '../../../../../shared/components/base-table/base-table.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header/section-header.component';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
  standalone: true,
  imports: [BaseTableComponent, SharedModule, SectionHeaderComponent],
})
export class CategoryManagementComponent implements OnInit, AfterViewInit {
  @Input() restaurantId!: string;

  categories: Category[] = [];

  @ViewChild('tplIcon', { static: true }) tplIcon!: TemplateRef<any>;
  @ViewChild('actions', { static: true }) actions!: TemplateRef<any>;
  @ViewChild(BaseTableComponent) table!: BaseTableComponent;

  columns: BaseColumn[] = [];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit() {
    this.columns = [
      { id: 'order', label: '#', template: undefined }, // índice de fila
      { id: 'icon', label: 'Icono', template: this.tplIcon },
      { id: 'name', label: 'Nombre' },
    ];
    this.cdr.detectChanges();
  }

  loadCategories() {
    this.categoryService.getCategories(this.restaurantId).subscribe((cats) => {
      // agregar índice dinámico para la columna "order"
      this.categories = cats.map((c, i) => ({ ...c, order: i + 1 }));
    });
  }

  addCategory() {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { mode: 'create', restaurantId: this.restaurantId, categoryService: this.categoryService },
    });

    ref.afterClosed().subscribe(async (payload) => {
      if (!payload) return;
      await this.categoryService.createCategory({ ...payload, restaurantId: this.restaurantId });
      this.loadCategories();
    });
  }

  editCategory(c: Category) {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { mode: 'edit', category: c, restaurantId: this.restaurantId, categoryService: this.categoryService },
    });

    ref.afterClosed().subscribe(async (payload) => {
      if (!payload) return;
      await this.categoryService.updateCategory(this.restaurantId, c.categoryId!, payload);
      this.loadCategories();
    });
  }

  deleteCategory(c: Category) {
    if (!confirm(`Eliminar categoría "${c.name}"?`)) return;
    this.categoryService.deleteCategory(this.restaurantId, c.categoryId!).then(() => this.loadCategories());
  }

  // Método llamado desde el SectionHeader para filtrar la tabla
  applyFilter(text: string) {
    this.table.applyFilter(text);
  }
}
