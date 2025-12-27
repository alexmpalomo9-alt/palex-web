import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../../../shared/shared.module';
import { CartItem } from '../../../../../customer/components/cart/model/cart.model';

@Component({
  selector: 'app-confirm-order-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './confirm-order-dialog.component.html',
  styleUrls: ['./confirm-order-dialog.component.scss'],
})
export class ConfirmOrderDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmOrderDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      tableId: string;
      tableNumber?: number;
      tableName?: string;
      items: CartItem[];
      total: number;
    }
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
