import { Component, Inject } from '@angular/core';
import { OrdersService } from '../../../services/order.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { TableService } from '../../../../restaurant/restaurant-tables/services/table.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { OrderStatusService } from '../../../../../shared/services/order-status/order-status.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { OrderDialogBaseComponent } from '../../base/order-dialog-base/order-dialog-base.component';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-kitchen-order-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './kitchen-order-dialog.component.html',
  styleUrls: ['./kitchen-order-dialog.component.scss']
})
export class KitchenOrderDialogComponent extends OrderDialogBaseComponent {

  constructor(
    protected override dialog: MatDialog,
    protected override dialogRef: MatDialogRef<KitchenOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public override data: any,
    protected override ordersService: OrdersService,
    protected override dialogService: DialogService,
    protected override tableService: TableService,
    protected override auth: AuthService,
    protected override orderStatusService: OrderStatusService
  ) {
    super(dialog, dialogRef, data, ordersService, dialogService, tableService, auth, orderStatusService);
  }

  // Ejemplo de acción específica de cocina
async markAsPreparing() {
  if (!this.orderId && !this.createdOrderId) return;

  this.loading = true;
  try {
    const targetOrderId = this.createdOrderId || this.orderId!;
    await this.ordersService.updateOrderStatus(
      this.restaurantId,
      targetOrderId,
      'preparing',
      'kitchen'
    );
    this.status = 'preparing';
    this.dialogService.infoDialog('Pedido en preparación', 'La cocina comenzó a preparar el pedido.');
    this.dialogRef.close(true);
  } catch (e: any) {
    this.dialogService.errorDialog('Error', e.message);
  } finally {
    this.loading = false;
  }
}

async markAsReady() {
  if (!this.orderId && !this.createdOrderId) return;

  this.loading = true;
  try {
    const targetOrderId = this.createdOrderId || this.orderId!;
    await this.ordersService.updateOrderStatus(
      this.restaurantId,
      targetOrderId,
      'ready',
      'kitchen'
    );
    this.status = 'ready';
    this.dialogService.infoDialog('Pedido listo', 'La cocina terminó el pedido.');
    this.dialogRef.close(true);
  } catch (e: any) {
    this.dialogService.errorDialog('Error', e.message);
  } finally {
    this.loading = false;
  }
}

}
