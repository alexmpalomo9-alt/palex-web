import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Order, OrderItem } from '../../../order/models/order.model';
import { OrdersService } from '../../../order/services/order.service';
import { MenuDialogComponent } from '../../restaurant-menu/menu-dialog/menu-dialog.component';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss'],
  imports: [SharedModule],
})
export class OrderDialogComponent implements OnInit {
  restaurantId!: string;
  orderId!: string;
  tableId!: string;
  tableNumber!: number;

  order$!: Observable<Order | null>;
  items$!: Observable<OrderItem[]>;

  constructor(
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.restaurantId = this.data.restaurantId;
    this.orderId = this.data.orderId;
    this.tableId = this.data.tableId;
    this.tableNumber = this.data.tableNumber;

    this.order$ = this.ordersService.getOrder(this.restaurantId, this.orderId);
    this.items$ = this.ordersService.getOrderItems(
      this.restaurantId,
      this.orderId
    );
  }

  // --------------------------------------------------------------------------
  // Agregar ítem → usar el diálogo de menú en modo ADD
  // --------------------------------------------------------------------------
  addItem() {
    const dialogRef = this.dialog.open(MenuDialogComponent, {
      data: {
        restaurantId: this.restaurantId,
        mode: 'add',
        orderId: this.orderId,
      },
    });

    dialogRef.afterClosed().subscribe(async (item: OrderItem | null) => {
      if (!item) return;

      await this.ordersService.addItemWithStatusCheck(
        this.restaurantId,
        this.orderId,
        item
      );
    });
  }

  // --------------------------------------------------------------------------
  // Cerrar pedido
  // --------------------------------------------------------------------------
  async closeOrder() {
    await this.ordersService.closeOrder(
      this.restaurantId,
      this.orderId,
      this.tableId
    );

    this.dialogRef.close(true);
  }

  // --------------------------------------------------------------------------
  // Cancelar pedido (similar a close pero con estado cancelado)
  // --------------------------------------------------------------------------
  async cancelOrder() {
    await this.ordersService.updateOrderStatus(
      this.restaurantId,
      this.orderId,
      'cancelled'
    );

    // liberar mesa
    await this.ordersService.closeOrder(
      this.restaurantId,
      this.orderId,
      this.tableId
    );

    this.dialogRef.close(true);
  }

  // --------------------------------------------------------------------------
  // Salir sin tocar nada
  // --------------------------------------------------------------------------
  exit() {
    this.dialogRef.close(null);
  }
}
