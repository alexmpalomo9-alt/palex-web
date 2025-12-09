import { Component, HostListener, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';

import { OrderItem, OrderStatus } from '../../../order/models/order.model';
import { MenuDialogComponent } from '../../restaurant-menu/menu-dialog/menu-dialog.component';
import { Product } from '../../../../products/model/product.model';
import { AuthService } from '../../../../auth/services/auth.service';

import { SharedModule } from '../../../../shared/shared.module';
import { OrderStatusService } from '../../../../shared/services/order-status/order-status.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { PaymentMethodDialogComponent } from '../payment-method-dialog/payment-method-dialog.component';
import { OrderDialogService } from '../../../order/services/order-dialog/order-dialog.service';

import { OrderNotesComponent } from '../../../order/components/order-notes/order-notes.component';
import { OrderItemsMobileComponent } from '../../../order/components/order-item-mobile/order-item-mobile.component';
import { OrderItemsTableComponent } from '../../../order/components/order-item-table/order-item-table.component';

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    SharedModule,
    OrderItemsTableComponent,
    OrderItemsMobileComponent,
    OrderNotesComponent,
  ],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss'],
})
export class OrderDialogComponent implements OnInit {
  orderId: string | null = null;
  createdOrderId: string | null = null;
  status: OrderStatus = 'draft';
  isEditMode = false;

  items: OrderItem[] = [];
  dataSource = new MatTableDataSource<OrderItem>();
  notes = '';
  loading = false;

  restaurantId = '';
  tableId = '';
  tableNumber = 0;

  displayedColumns = ['name', 'qty', 'price', 'subtotal', 'actions'];
  isMobile = window.innerWidth <= 768;

  private originalItems: OrderItem[] = [];
  private originalNotes = '';

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

    private auth: AuthService,
    private orderStatusService: OrderStatusService,

    private orderDialogService: OrderDialogService,
    private dialogService: DialogService
  ) {
    this.restaurantId = data.restaurantId;
    this.tableId = data.tableId;
    this.tableNumber = data.number || data.tableNumber;
    this.orderId = data.orderId ?? null;
  }

  ngOnInit(): void {
    if (this.orderId) {
      this.loadOrder();
    }
  }

  get orderStatusLabel(): string {
    return this.orderStatusService.getOrderStatusLabel(this.status);
  }

  private async loadOrder() {
    try {
      this.loading = true;
      const order = await this.orderDialogService.loadOrder(
        this.restaurantId,
        this.orderId!
      );

      this.items = order.items;
      this.dataSource.data = [...this.items];

      this.notes = order.notes;
      this.status = order.status;
      this.isEditMode = this.status !== 'draft';

      this.originalItems = order.originalItems;
      this.originalNotes = order.originalNotes;
    } catch (e: any) {
      this.dialogService.errorDialog('Error', e.message);
      this.dialogRef.close();
    } finally {
      this.loading = false;
    }
  }

  addItemDialog() {
    const dialogRef = this.dialog.open(MenuDialogComponent, {
      disableClose: true,
      data: { restaurantId: this.restaurantId },
    });

    dialogRef.afterClosed().subscribe((product: Product | null) => {
      if (!product) return;

      const newItem: OrderItem = {
        productId: product.productId,
        name: product.name,
        price: product.isOffer
          ? product.offerPrice ?? product.price
          : product.price,
        qty: 1,
        position: this.items.length,
        subtotal: product.isOffer
          ? product.offerPrice ?? product.price
          : product.price,
        notes: '',
      };

      this.items.push(newItem);
      this.dataSource.data = [...this.items];
    });
  }

  removeItem(i: number) {
    this.dialogService
      .confirmDialog({
        title: 'Eliminar item?',
        message: '¿Estás seguro de querer quitar el item del pedido?',
        type: 'question',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.items.splice(i, 1);
          this.dataSource.data = [...this.items];
        }
      });
  }

  getTotal(): number {
    return this.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }

  async createOrder() {
    this.loading = true;
    try {
      const waiter = this.auth.getUserID() ?? 'unknown';
      const orderId = await this.orderDialogService.createOrder({
        restaurantId: this.restaurantId,
        tableId: this.tableId,
        tableNumber: this.tableNumber,
        createdBy: waiter,
        waiter,
        notes: this.notes,
        items: this.items,
      });

      this.dialogRef.close(orderId);
    } finally {
      this.loading = false;
    }
  }

  async updateOrder() {
    const targetOrderId = this.createdOrderId || this.orderId;
    if (!targetOrderId) return;

    const hasChanges = this.orderDialogService.hasChanges(
      this.items,
      this.originalItems,
      this.notes,
      this.originalNotes
    );

    if (!hasChanges) {
      this.dialogService.infoDialog(
        'Sin cambios',
        'No se detectaron cambios en el pedido.'
      );
      return;
    }

    if (this.items.length === 0) {
      this.dialogService.infoDialog(
        'Atención',
        'Debe agregar al menos un producto.'
      );
      return;
    }

    this.loading = true;
    try {
      await this.orderDialogService.updateOrder({
        restaurantId: this.restaurantId,
        orderId: targetOrderId,
        items: this.items,
        notes: this.notes,
      });

      this.dialogService.infoDialog(
        'Pedido actualizado',
        'El pedido fue actualizado correctamente.'
      );
      this.dialogRef.close(true);
    } finally {
      this.loading = false;
    }
  }

  async closeOrder() {
    const dialogRef = this.dialog.open(PaymentMethodDialogComponent, {
      data: { orderTotal: this.getTotal() },
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (!result) return;

    this.loading = true;
    try {
      await this.orderDialogService.closeOrder({
        orderId: this.orderId,
        restaurantId: this.restaurantId,
        tableId: this.tableId,
        paymentMethod: result.method,
      });
      this.dialogRef.close(true);
    } finally {
      this.loading = false;
    }
  }

  async cancelOrder() {
    const confirm = await firstValueFrom(
      this.dialogService.confirmDialog({
        title: 'Cancelar Pedido?',
        message: '¿Estás seguro de querer cancelar este pedido?',
        type: 'question',
      })
    );

    if (!confirm) return;

    this.loading = true;
    try {
      await this.orderDialogService.cancelOrder({
        restaurantId: this.restaurantId,
        tableId: this.tableId,
        orderId: this.orderId,
        userId: this.auth.getUserID(),
      });

      this.dialogRef.close(true);
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.dialogRef.close({ created: false });
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: any) {
    this.isMobile = e.target.innerWidth <= 768;
  }
}
