import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderItem } from '../../../order/models/order.model';
import { SharedModule } from '../../../../shared/shared.module';
import { Product } from '../../../../products/model/product.model';
import { ProductService } from '../../../../products/services/product.service';

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
  imports: [SharedModule],
})
export class MenuDialogComponent implements OnInit {
  isAddMode = false;
  orderId: string | null = null;

  restaurantId!: string;

  // 🔥 Ahora vienen de Firestore
  products: Product[] = [];

  // carrito para crear pedido
  cart: OrderItem[] = [];

  constructor(
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.isAddMode = this.data?.mode === 'add';
    this.orderId = this.data?.orderId ?? null;

    this.restaurantId = this.data?.restaurantId;

    // Si pasaron categoría → filtrar por categoría
    if (this.data?.category) {
      this.loadProductsByCategory(this.data.category);
    } else {
      this.loadAllProducts();
    }
  }

  // ------------------------------------------------------------
  // Cargar TODOS los productos del restaurante
  // ------------------------------------------------------------
  loadAllProducts() {
    this.productService
      .getAllProducts(this.restaurantId)
      .subscribe((products) => (this.products = products));
  }

  // ------------------------------------------------------------
  // Cargar productos por categoría (solo disponibles)
  // ------------------------------------------------------------
  loadProductsByCategory(category: string) {
    this.productService
      .getAvailableProductsByCategory(this.restaurantId, category)
      .subscribe((products) => (this.products = products));
  }

  // --------------------------------------------------------------------------
  // Select product
  // --------------------------------------------------------------------------
  selectProduct(prod: Product) {
    const item: OrderItem = {
      productId: prod.productId!,
      name: prod.name,
      price: prod.price,
      quantity: 1,
      subtotal: prod.price,
      categoryId: prod.category
    };

    if (this.isAddMode) {
      this.dialogRef.close(item);
    } else {
      const found = this.cart.find((x) => x.productId === prod.productId);

      if (found) {
        found.quantity++;
        found.subtotal = found.quantity * found.price;
      } else {
            this.cart.push(item);
      }
    }
  }

  removeItem(i: number) {
    this.cart.splice(i, 1);
  }

  confirm() {
    this.dialogRef.close(this.cart);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
