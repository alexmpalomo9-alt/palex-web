import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../model/restaurant.model';
import { ProductListComponent } from '../../../../products/components/product-list/product-list.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { Product } from '../../../../products/model/product.model';
import { ProductDialogService } from '../../../../products/services/product-dialog.service';
import { ProductService } from '../../../../products/services/product.service';

@Component({
  selector: 'app-restaurant-products',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ProductListComponent,
  ],
  templateUrl: './restaurant-products.component.html',
  styleUrls: ['./restaurant-products.component.scss'],
})
export class RestaurantProductsComponent implements OnInit {
  restaurant: Restaurant | null = null;
  dataSource = new MatTableDataSource<Product>();

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private productService: ProductService,
    private productDialogService: ProductDialogService,
    private dialogService: DialogService,
    private router: Router
  ) {}

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

  createProduct() {
    if (!this.restaurant) return;

    this.productDialogService
      .openProductDialog({ mode: 'create' })
      .subscribe(async (result) => {
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelar',
            'No se realizaron cambios.'
          );
          return;
        }

        try {
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
      .openProductDialog({ mode: 'edit', data: product })
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
          const { restaurantId: _ignore, ...cleanData } = result;

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
}
