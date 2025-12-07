import { Component, HostListener, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OrdersService } from '../../../order/services/order.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { PaymentMethodDialogComponent } from '../payment-method-dialog/payment-method-dialog.component';
import { SharedModule } from '../../../../shared/shared.module';
import { OrderItem, OrderStatus } from '../../../order/models/order.model';
import { MenuDialogComponent } from '../../restaurant-menu/menu-dialog/menu-dialog.component';
import { Product } from '../../../../products/model/product.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { TableService } from '../../restaurant-tables/services/table.service';
import { firstValueFrom } from 'rxjs';
import { OrderStatusService } from '../../../../shared/services/order-status/order-status.service';

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss'],
})
export class OrderDialogComponent implements OnInit {
  orderId: string | null = null;
  createdOrderId: string | null = null;
  status: OrderStatus = 'draft';
  isEditMode: boolean = false;

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
  private originalNotes: string = '';

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ordersService: OrdersService,
    private dialogService: DialogService,
    private tableService: TableService,
    private auth: AuthService,
    private orderStatusService: OrderStatusService
  ) {
    this.restaurantId = data.restaurantId;
    this.tableId = data.tableId;
    this.tableNumber = data.number || data.tableNumber; // Número de mesa
    this.orderId = data.orderId ?? null;
  }

  ngOnInit(): void {
    if (this.orderId) {
      this.loadOrder();
    } else {
      this.isEditMode = false;
      this.status = 'draft';
    }
  }

  // Getter para mostrar automáticamente la etiqueta del estado
  get orderStatusLabel(): string {
    return this.orderStatusService.getOrderStatusLabel(this.status);
  }

  private async loadOrder() {
    try {
      this.loading = true;
      const order = await this.ordersService.getOrderWithItems(
        this.restaurantId,
        this.orderId!
      );

      this.items = (order.items || []).map((i: any) => ({
        itemId: i.itemId,
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        subtotal: i.subtotal ?? i.price * i.qty,
        position: i.position,
        notes: i.notes ?? '',
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));

      // Guardamos copia original para comparaciones
      this.originalItems = this.items.map((i) => ({ ...i }));
      this.originalNotes = order.notes || '';

      this.dataSource.data = [...this.items];
      this.notes = order.notes || '';
      this.status = order.status;
      this.isEditMode = this.status !== 'draft';
    } catch (e: any) {
      this.dialogService.errorDialog('Error', e.message);
      this.dialogRef.close();
    } finally {
      this.loading = false;
    }
  }

  // Método auxiliar para comparar cambios
  private hasChanges(): boolean {
    if (this.notes !== this.originalNotes) return true;

    if (this.items.length !== this.originalItems.length) return true;

    for (let i = 0; i < this.items.length; i++) {
      const current = this.items[i];
      const original = this.originalItems[i];
      if (
        current.productId !== original.productId ||
        current.qty !== original.qty ||
        current.price !== original.price ||
        current.notes !== original.notes
      ) {
        return true;
      }
    }

    return false;
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
        price: this.getProductPrice(product),
        qty: 1,
        position: this.items.length,
        subtotal: this.getProductPrice(product),
        notes: '',
      };

      this.items.push(newItem);
      this.dataSource.data = [...this.items];
    });
  }

  getProductPrice(product: Product): number {
    return product.isOffer
      ? product.offerPrice ?? product.price
      : product.price;
  }

  removeItem(index: number) {
    this.dialogService
      .confirmDialog({
        title: 'Eliminar item?',
        message: '¿Estás seguro de querer quitar el item del pedido?.',
        type: 'question',
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.items.splice(index, 1);
          this.dataSource.data = [...this.items]; // refrescar tabla
        }
      });
  }

  getTotal(): number {
    return this.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }

  async createOrder() {
    const waiter = this.auth.getUserID() ?? 'unknown';
    const orderId = await this.ordersService.createOrderForMozo(
      this.restaurantId,
      {
        tableId: this.tableId,
        tableNumber: this.tableNumber,
        createdBy: waiter,
        waiter,
        notes: this.notes,
        items: this.items,
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
    const targetOrderId = this.createdOrderId || this.orderId;
    if (!targetOrderId) return;

    if (!this.hasChanges()) {
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
      await this.ordersService.updateOrder(
        this.restaurantId,
        targetOrderId,
        this.items,
        this.notes,
        'mozo'
      );
      this.status = 'updated';
      this.dialogService.infoDialog(
        'Pedido actualizado',
        'El pedido fue actualizado correctamente.'
      );
      this.dialogRef.close(true);
    } catch (e: any) {
      this.dialogService.errorDialog('Error', e.message);
    } finally {
      this.loading = false;
    }
  }

  async confirmOrder() {
    if (this.isEditMode) {
      await this.updateOrder();
    } else {
      await this.createOrder();
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
      const status = this.mapPaymentToStatus(result.method);
      await this.ordersService.updateOrderStatus(
        this.restaurantId,
        this.createdOrderId || this.orderId!,
        status,
        'mozo'
      );
      await this.tableService.clearTable(this.restaurantId, this.tableId);
      this.dialogService.infoDialog(
        'Pedido cerrado',
        'Se registró el pago, se cerró el pedido y la mesa quedó disponible.'
      );
      this.dialogRef.close(true);
    } catch (e: any) {
      this.dialogService.errorDialog('Error', e.message);
    } finally {
      this.loading = false;
    }
  }

  async cancelOrder() {
    if (!this.orderId && !this.createdOrderId) return;

    const confirm = await firstValueFrom(
      this.dialogService.confirmDialog({
        title: 'Cancelar Pedido?',
        message:
          '¿Estás seguro de querer cancelar este pedido? Esta acción no se puede deshacer.',
        type: 'question',
      })
    );
    if (!confirm) return;

    this.loading = true;
    try {
      const targetOrderId = this.createdOrderId || this.orderId!;
      const userId = this.auth.getUserID() ?? 'unknown';
      await this.ordersService.cancelOrder(
        this.restaurantId,
        targetOrderId,
        userId
      );
      await this.tableService.clearTable(this.restaurantId, this.tableId);
      this.dialogService.infoDialog(
        'Pedido cancelado',
        'El pedido fue cancelado y la mesa quedó disponible.'
      );
      this.dialogRef.close(true);
    } catch (e: any) {
      this.dialogService.errorDialog('Error', e.message);
    } finally {
      this.loading = false;
    }
  }

  mapPaymentToStatus(method: string): OrderStatus {
    return 'closed';
  }

  cancel() {
    this.dialogRef.close({ created: false });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }
}
