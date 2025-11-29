import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ProductListComponent,
  ],
  templateUrl: './restaurant-menu.component.html',
  styleUrls: ['./restaurant-menu.component.scss'],
})
export class RestaurantMenuComponent implements OnInit {
  restaurant: Restaurant | null = null;
  dataSource = new MatTableDataSource<Product>();

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private productService: ProductService,
    private productDialogService: ProductDialogService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      const slug = params.get('restaurantId');
      if (!slug) return;

      this.restaurantService.getRestaurantBySlug(slug).subscribe((res) => {
        this.restaurant = res[0] ?? null;
        if (this.restaurant) {
          this.loadProducts(this.restaurant.restaurantId!);
        }
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
    this.productDialogService
      .openProductDialog({ mode: 'create' })
      .subscribe(async (result) => {
        // Caso CANCELAR
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelar',
            'No se realizaron cambios.'
          );
          return;
        }
        if (!this.restaurant) return;

        // Caso ACEPTAR (crear producto)
        try {
          await this.productService.createProduct({
            ...result,
            restaurantId: this.restaurant.restaurantId!,
          });

          this.dialogService.infoDialog(
            'Éxito',
            'Producto creado correctamente.'
          );

          this.loadProducts(this.restaurant.restaurantId!);
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
          if (!this.restaurant) return;

          const { restaurantId, ...cleanData } = result;
          await this.productService.updateProduct(
            this.restaurant.restaurantId!,
            product.productId!,
            cleanData
          );

          this.dialogService.infoDialog(
            'Éxito',
            'Producto editado correctamente.'
          );
          this.loadProducts(this.restaurant.restaurantId!);
        } catch (e: any) {
          this.dialogService.errorDialog(
            'Error',
            e.message || 'Ocurrió un error inesperado.'
          );
        }
      });
  }
}
