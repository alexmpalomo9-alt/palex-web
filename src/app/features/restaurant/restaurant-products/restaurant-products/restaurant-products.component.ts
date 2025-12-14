import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../model/restaurant.model';
import { ProductListComponent } from '../../../../products/components/product-list/product-list.component';
import { Product } from '../../../../products/model/product.model';
import { ProductDialogService } from '../../../../products/services/product-dialog.service';
import { ProductService } from '../../../../products/services/product.service';
import { CategoryManagementComponent } from '../../categories/components/category-management/category-management.component';
import { SharedModule } from '../../../../shared/shared.module';
import { SectionHeaderComponent } from '../../shared/section-header/section-header/section-header.component';
import { DialogService } from '../../../../core/services/dialog-service/dialog.service';

@Component({
  selector: 'app-restaurant-products',
  imports: [
    ProductListComponent,
    CategoryManagementComponent,
    SharedModule,
    SectionHeaderComponent,
  ],
  templateUrl: './restaurant-products.component.html',
  styleUrls: ['./restaurant-products.component.scss'],
})
export class RestaurantProductsComponent implements OnInit {
  restaurant: Restaurant | null = null;
  dataSource = new MatTableDataSource<Product>();
  @ViewChild('productList') productList!: ProductListComponent;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private productService: ProductService,
    private productDialogService: ProductDialogService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  onSearch(value: string) {
    this.productList.applyFilter(value);
  }

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      const slug = params.get('restaurantId');
      if (!slug) return;

      this.restaurantService
        .getRestaurantBySlug(slug)
        .subscribe((restaurant) => {
          if (!restaurant) return;

          this.restaurant = restaurant;
          this.loadProducts(this.restaurant.restaurantId);
        });
    });
  }

  loadProducts(restaurantId: string) {
    this.restaurantService
      .getProductsByRestaurant(restaurantId)
      .subscribe((products) => {
        this.dataSource.data = products;
      });
  }

  async createProduct() {
    if (!this.restaurant) return;

    this.productDialogService
      .openProductDialog({
        mode: 'create',
        restaurantId: this.restaurant.restaurantId,
      })
      .subscribe(async (result) => {
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelar',
            'No se realizaron cambios.'
          );
          return;
        }

        try {
          // 🔥 categoryId ya viene del diálogo
          if (!result.categoryId) {
            throw new Error('El producto debe tener una categoría.');
          }

          await this.productService.createProduct({
            ...result,
            restaurantId: this.restaurant!.restaurantId,
          });

          this.dialogService.infoDialog(
            'Éxito',
            'Producto creado correctamente.'
          );
          this.loadProducts(this.restaurant!.restaurantId);
        } catch (e: any) {
          this.dialogService.errorDialog(
            'Error',
            e.message || 'Ocurrió un error inesperado.'
          );
        }
      });
  }

  editProduct(product: Product) {
    if (!this.restaurant) return;

    this.productDialogService
      .openProductDialog({
        mode: 'edit',
        restaurantId: this.restaurant.restaurantId,
        data: product,
      })
      .subscribe(async (result) => {
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelar',
            'No se realizaron cambios.'
          );
          return;
        }

        try {
          const restaurantId = this.restaurant!.restaurantId;
          const { restaurantId: _, ...cleanData } = result;

          await this.productService.updateProduct(
            restaurantId,
            product.productId!,
            cleanData
          );

          this.dialogService.infoDialog(
            'Éxito',
            'Producto editado correctamente.'
          );
          this.loadProducts(restaurantId);
        } catch (e: any) {
          this.dialogService.errorDialog(
            'Error',
            e.message || 'Ocurrió un error inesperado.'
          );
        }
      });
  }

  deleteProduct(product: Product) {
    if (!product.productId || !this.restaurant) return;

    this.dialogService
      .confirmDialog({
        title: '¿Eliminar Permanente?',
        message:
          '¿Estás seguro de que deseas eliminar el producto de forma permanente? Esta acción no se puede deshacer.',
        type: 'confirm',
      })
      .subscribe(async (result) => {
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelado',
            'No se realizó la acción.'
          );
          return;
        }

        try {
          await this.productService.deleteProduct(
            this.restaurant!.restaurantId,
            product.productId
          );
          this.dialogService.infoDialog(
            'Éxito',
            'El producto ha sido eliminado correctamente.'
          );
          this.loadProducts(this.restaurant!.restaurantId);
        } catch (error: any) {
          this.dialogService.errorDialog(
            'Error',
            error.message || 'Ocurrió un error inesperado.'
          );
        }
      });
  }

  goToMenu() {
    if (!this.restaurant) return;
    this.router.navigate(['menu'], { relativeTo: this.route.parent });
  }
  @HostListener('window:scroll')
  onScroll() {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
}
