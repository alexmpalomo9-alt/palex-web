import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { ProductDialogComponent } from '../components/product-dialog/product-dialog.component';

type DialogMode = 'create' | 'edit';

@Injectable({
  providedIn: 'root',
})
export class ProductDialogService {
  constructor(private dialog: MatDialog) {}
  openProductDialog(options: {
    mode: DialogMode;
    data?: Product;
  }): Observable<Product> {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      disableClose: true,
      width: '600px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
      data: options,
    });

    return dialogRef.afterClosed();
  }
}
