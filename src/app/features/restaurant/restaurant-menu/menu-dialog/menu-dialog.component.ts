import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormControl, FormsModule } from '@angular/forms';
import { Product } from '../../../../products/model/product.model';
import { SharedModule } from '../../../../shared/shared.module';
import { ProductService } from '../../../../products/services/product.service';
import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';

interface MenuSelectedItem {
  product: Product;
  qty: number;
}

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
  imports: [SharedModule, FormsModule],
})
export class MenuDialogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedItems: MenuSelectedItem[] = [];
  categories: string[] = [];

  searchControl = new FormControl('');
  categoryControl = new FormControl('all');

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { restaurantId: string },
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.categoryControl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadProducts(): void {
    this.productService
      .getAllProducts(this.data.restaurantId)
      .subscribe((products) => {
        this.products = products ?? [];
        this.filteredProducts = [...this.products];
        this.categories = Array.from(
          new Set(
            this.products
              .map((p) => p.categoryName)
              .filter((c): c is string => !!c)
          )
        );
      });
  }

  applyFilters(): void {
    const search = (this.searchControl.value ?? '').toLowerCase();
    const category = this.categoryControl.value;

    this.filteredProducts = this.products.filter(
      (p) =>
        (p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)) &&
        (category === 'all' || p.categoryName === category)
    );
  }

  toggleProduct(product: Product): void {
    const index = this.selectedItems.findIndex(
      (i) => i.product.productId === product.productId
    );

    if (index >= 0) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push({
        product,
        qty: 1,
      });
    }
  }

  isSelected(product: Product): boolean {
    return this.selectedItems.some(
      (i) => i.product.productId === product.productId
    );
  }

  get totalSelectedPrice(): number {
    return this.selectedItems.reduce((sum, i) => {
      const price = i.product.isOffer
        ? i.product.offerPrice ?? i.product.price
        : i.product.price;

      return sum + price * i.qty;
    }, 0);
  }

  clearSelection(): void {
    this.selectedItems = [];
  }

  confirmSelection(): void {
    this.dialogRef.close(this.selectedItems);
  }

  close(): void {
    this.dialogRef.close();
  }

  getQty(product: Product): number {
    return (
      this.selectedItems.find((i) => i.product.productId === product.productId)
        ?.qty ?? 0
    );
  }

  increaseQty(product: Product): void {
    const item = this.selectedItems.find(
      (i) => i.product.productId === product.productId
    );
    if (item) item.qty++;
  }

  decreaseQty(product: Product): void {
    const item = this.selectedItems.find(
      (i) => i.product.productId === product.productId
    );
    if (item && item.qty > 1) item.qty--;
  }
  get selectedCount(): number {
    return this.selectedItems.length;
  }

  back() {
    this.dialogRef.close(null); // no devuelve nada
  }
}
