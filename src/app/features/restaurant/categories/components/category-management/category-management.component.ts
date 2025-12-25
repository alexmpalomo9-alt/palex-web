import {
  Component,
  Input,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Category } from '../../model/category.model';
import { CategoryService } from '../../services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import {
  BaseColumn,
  BaseTableComponent,
} from '../../../../../shared/components/base-table/base-table.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header/section-header.component';
import { AddButtonComponent } from '../../../../../shared/components/button/add-button/add-button.component';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { Restaurant } from '../../../model/restaurant.model';
import { UiFeedbackService } from '../../../../../shared/services/ui-feedback/ui-feedback.service';
import { DialogService } from '../../../../../core/services/dialog-service/dialog.service';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
  standalone: true,
  imports: [
    BaseTableComponent,
    SharedModule,
    SectionHeaderComponent,
    AddButtonComponent,
  ],
})
export class CategoryManagementComponent implements OnInit, AfterViewInit {
  @Input() restaurantId!: string;

  categories: Category[] = [];
  restaurant: Restaurant | null = null;

  @ViewChild('tplIcon', { static: true }) tplIcon!: TemplateRef<any>;
  @ViewChild('actions', { static: true }) actions!: TemplateRef<any>;
  @ViewChild(BaseTableComponent) table!: BaseTableComponent;

  columns: BaseColumn[] = [];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private ui: UiFeedbackService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      const slug = params.get('restaurantId'); // este es el slug
      if (!slug) return;

      this.restaurantService
        .getRestaurantBySlug(slug)
        .subscribe((restaurant) => {
          if (!restaurant) {
            console.error('No se encontró restaurante con slug', slug);
            return;
          }

          this.restaurant = restaurant;
          this.restaurantId = restaurant.restaurantId; // 🔑 asignar ID real
          // console.log('restaurantId detectado:', this.restaurantId);
          this.loadCategories();
        });
    });
  }

  ngAfterViewInit() {
    this.columns = [
      { id: 'order', label: '#', template: undefined }, // índice de fila
      { id: 'name', label: 'Nombre' },
      { id: 'icon', label: 'Icono', template: this.tplIcon },
    ];
    this.cdr.detectChanges();
  }

  loadCategories() {
    this.categoryService.getCategories(this.restaurantId).subscribe((cats) => {
      // console.log('Categorías recibidas:', cats);
      this.categories = cats.map((c, i) => ({ ...c, order: i + 1 }));
    });
  }

  addCategory() {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '520px',
      disableClose: true,
      data: {
        mode: 'create',
        restaurantId: this.restaurantId,
        categoryService: this.categoryService,
      },
    });

    ref.afterClosed().subscribe(async (payload) => {
      if (!payload) {
        this.ui.show('No se creó ninguna categoría', 'info');
        return;
      }

      try {
        await this.categoryService.createCategory({
          ...payload,
          restaurantId: this.restaurantId,
        });
        this.ui.show('Categoría creada correctamente', 'success');
        this.loadCategories();
      } catch (err: any) {
        this.ui.show(err.message || 'Error al crear la categoría', 'error');
      }
    });
  }

  editCategory(c: Category) {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '520px',
      disableClose: true,
      data: {
        mode: 'edit',
        category: c,
        restaurantId: this.restaurantId,
        categoryService: this.categoryService,
      },
    });

    ref.afterClosed().subscribe(async (payload) => {
      if (!payload) {
        this.ui.show('No se realizaron cambios', 'info');
        return;
      }

      try {
        await this.categoryService.updateCategory(
          this.restaurantId,
          c.categoryId!,
          payload
        );
        this.ui.show('Categoría actualizada correctamente', 'success');
        this.loadCategories();
      } catch (err: any) {
        this.ui.show(
          err.message || 'Error al actualizar la categoría',
          'error'
        );
      }
    });
  }

  deleteCategory(c: Category) {
    this.dialogService
      .confirmDialog({
        title: 'Eliminar categoría del restaurante',
        message:
          '¿Deseas eliminar la categoria del restaurante?.',
        type: 'question',
      })
      .subscribe(async (ok) => {
        if (!ok) {
          this.ui.show('Acción cancelada', 'info');
          return;
        }

        try {
          await this.categoryService.deleteCategory(
            this.restaurantId,
            c.categoryId!
          );
          this.ui.show('Categoría eliminada correctamente', 'success');
          this.loadCategories();
        } catch (err: any) {
          this.ui.show(
            err.message || 'Error al eliminar la categoría',
            'error'
          );
        }
      });
  }

  // Método llamado desde el SectionHeader para filtrar la tabla
  applyFilter(text: string) {
    this.table.applyFilter(text);
  }
}
