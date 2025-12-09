import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../../../auth/services/auth.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Product } from '../../../../../products/model/product.model';
import { OrderStatusService } from '../../../../../shared/services/order-status/order-status.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { MenuDialogComponent } from '../../../../restaurant/restaurant-menu/menu-dialog/menu-dialog.component';
import { PaymentMethodDialogComponent } from '../../../../restaurant/restaurant-orders/payment-method-dialog/payment-method-dialog.component';
import { TableService } from '../../../../restaurant/restaurant-tables/services/table.service';
import { OrderItem, OrderStatus } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-waiter-order-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './waiter-order-dialog.component.html',
  styleUrls: ['./waiter-order-dialog.component.scss'],
})
export class WaiterOrderDialogComponent implements OnInit {

  restaurantId = '';
  tableId = '';
  tableNumber = 0;
  orderId: string | null = null;

  items: OrderItem[] = [];
  notes = '';
  status: OrderStatus = 'draft';
  isEditMode = false;
  loading = false;

  isMobile = window.innerWidth <= 768;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<WaiterOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orderService: OrderService,
    private tableService: TableService,
    private dialogService: DialogService,
    private auth: AuthService,
    private statusService: OrderStatusService
  ) {
    this.restaurantId = data.restaurantId;
    this.tableId = data.tableId;
    this.tableNumber = data.number;
    this.orderId = data.orderId ?? null;
  }

  get statusLabel() {
    return this.statusService.getOrderStatusLabel(this.status);
  }

  async ngOnInit() {
    if (this.orderId) {
      await this.loadOrder();
      this.isEditMode = true;
    }
  }

  async loadOrder() {
    this.loading = true;

    try {
      const order = await this.orderService.getOrderWithItems(
        this.restaurantId,
        this.orderId!
      );

      this.items = order.items || [];
      this.notes = order.notes || '';
      this.status = order.status;

    } catch (err: any) {
      this.dialogService.errorDialog('Error', err.message);
      this.dialogRef.close();
    }

    this.loading = false;
  }

  addItem() {
    const ref = this.dialog.open(MenuDialogComponent, {
      data: { restaurantId: this.restaurantId },
      disableClose: true,
    });

    ref.afterClosed().subscribe((product: Product) => {
      if (!product) return;

      this.items.push({
        productId: product.productId,
        name: product.name,
        price: product.isOffer ? (product.offerPrice ?? product.price) : product.price,
        qty: 1,
        subtotal: product.price,
        position: 0
      });
    });
  }

  updateQty(event: { index: number; qty: number }) {
    this.items[event.index].qty = event.qty;
  }

  removeItem(index: number) {
    this.dialogService
      .confirmDialog({
        title: 'Eliminar',
        message: '¿Seguro que quieres quitar este producto?',
        type: 'question',
      })
      .subscribe((ok) => {
        if (ok) this.items.splice(index, 1);
      });
  }

  getTotal(): number {
    return this.items.reduce((t, i) => t + i.price * i.qty, 0);
  }

  async createOrder() {
    const waiter = this.auth.getUserID() ?? 'unknown';

    const orderId = await this.orderService.createOrderForMozo(
      this.restaurantId,
      {
        tableId: this.tableId,
        tableNumber: this.tableNumber,
        waiter,
        notes: this.notes,
        items: this.items,
        createdBy: ''
      }
    );

    await this.tableService.assignOrderToTable(
      this.restaurantId,
      this.tableId,
      orderId
    );

    this.dialogRef.close(orderId);
  }

  async updateOrder() {
    if (!this.orderId) return;

    await this.orderService.updateOrder(
      this.restaurantId,
      this.orderId,
      this.items,
      this.notes,
      'mozo'
    );

    this.dialogService.infoDialog('Actualizado', 'Pedido actualizado.');
    this.dialogRef.close(true);
  }

  async closeOrder() {
    const ref = this.dialog.open(PaymentMethodDialogComponent, {
      data: { orderTotal: this.getTotal() },
    });

    const result = await ref.afterClosed().toPromise();
    if (!result) return;

    const status = result.method === 'cash' ? 'paid_cash' : 'paid_card';

    await this.orderService.updateOrderStatus(
      this.restaurantId,
      this.orderId!,
      status,
      'mozo'
    );

    await this.tableService.clearTable(this.restaurantId, this.tableId);
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close();
  }
}
