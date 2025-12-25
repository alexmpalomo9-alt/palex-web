import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../model/restaurant.model';
import { ProductListComponent } from '../../../../products/components/product-list/product-list.component';
import { Product } from '../../../../products/model/product.model';
import { ProductDialogService } from '../../../../products/services/product-dialog.service';
import { ProductService } from '../../../../products/services/product.service';
import { SharedModule } from '../../../../shared/shared.module';
import { SectionHeaderComponent } from '../../shared/section-header/section-header/section-header.component';
import { DialogService } from '../../../../core/services/dialog-service/dialog.service';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { UiFeedbackService } from '../../../../shared/services/ui-feedback/ui-feedback.service';

@Component({
  selector: 'app-restaurant-products',
  imports: [
    ProductListComponent,
    SharedModule,
    SectionHeaderComponent,
    AddButtonComponent,
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
    private uiFeedback: UiFeedbackService,
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
          this.uiFeedback.show('No se realizaron cambios.', 'info');
          return;
        }

        try {
          if (!result.categoryId) {
            throw new Error('El producto debe tener una categoría.');
          }

          await this.productService.createProduct({
            ...result,
            restaurantId: this.restaurant!.restaurantId,
          });

          this.uiFeedback.show('Producto creado correctamente.', 'success');
          this.loadProducts(this.restaurant!.restaurantId);
        } catch (e: any) {
          this.uiFeedback.show(
            e.message || 'Ocurrió un error inesperado.',
            'error'
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
          this.uiFeedback.show('No se realizaron cambios.', 'info');
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

          this.uiFeedback.show('Producto editado correctamente.', 'success');
          this.loadProducts(restaurantId);
        } catch (e: any) {
          this.uiFeedback.show(
            e.message || 'Ocurrió un error inesperado.',
            'error'
          );
        }
      });
  }
  deleteProduct(product: Product) {
    if (!product.productId || !this.restaurant) return;

    this.dialogService
      .confirmDialog({
        title: '¿Eliminar permanente?',
        message:
          '¿Estás seguro de que deseas eliminar el producto de forma permanente? Esta acción no se puede deshacer.',
        type: 'confirm',
      })
      .subscribe(async (result) => {
        if (!result) {
          this.uiFeedback.show('No se realizó la acción.', 'info');
          return;
        }

        try {
          await this.productService.deleteProduct(
            this.restaurant!.restaurantId,
            product.productId
          );

          this.uiFeedback.show(
            'El producto ha sido eliminado correctamente.',
            'success'
          );
          this.loadProducts(this.restaurant!.restaurantId);
        } catch (e: any) {
          this.uiFeedback.show(
            e.message || 'Ocurrió un error inesperado.',
            'error'
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
