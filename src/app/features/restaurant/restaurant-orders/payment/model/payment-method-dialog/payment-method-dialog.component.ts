import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../../../../shared/shared.module';

@Component({
  selector: 'app-payment-method-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './payment-method-dialog.component.html',
  styleUrl: './payment-method-dialog.component.scss',
})
export class PaymentMethodDialogComponent {
  payment = {
    method: '',
    detail: '',
  };

  total = 0;

  constructor(
    private dialogRef: MatDialogRef<PaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.total = data.orderTotal;
  }

  confirm() {
    this.dialogRef.close(this.payment);
  }
}
