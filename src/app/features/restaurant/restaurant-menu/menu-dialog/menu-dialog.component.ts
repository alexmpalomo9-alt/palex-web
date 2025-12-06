import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormsModule } from '@angular/forms';
import { Product } from '../../../../products/model/product.model';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
  imports: [SharedModule, FormsModule],
})
export class MenuDialogComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];

  searchControl = new FormControl('');
  categoryControl = new FormControl('all');

  constructor(
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] }
  ) {}

  ngOnInit(): void {
    this.products = this.data.products ?? [];
    this.filteredProducts = [...this.products];

    // obtener categorías únicas
    this.categories = Array.from(new Set(this.products.map(p => p.categoryId)))
      .filter(c => c);

    // escuchar cambios reactivos
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.categoryControl.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const search = (this.searchControl.value ?? '').toLowerCase();
    const category = this.categoryControl.value;

    this.filteredProducts = this.products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search) ||
        (p.description?.toLowerCase().includes(search) ?? false);

      const matchCategory =
        category === 'all' || p.categoryId === category;

      return matchSearch && matchCategory;
    });
  }

  addToOrder(product: Product): void {
    this.dialogRef.close(product);
  }

  close(): void {
    this.dialogRef.close();
  }
}
