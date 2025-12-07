import { Component, HostListener, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { OrdersService } from '../../../order/services/order.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { PaymentMethodDialogComponent } from '../payment-method-dialog/payment-method-dialog.component';
import { SharedModule } from '../../../../shared/shared.module';
import { OrderItem, OrderStatus } from '../../../order/models/order.model';
import { MenuDialogComponent } from '../../restaurant-menu/menu-dialog/menu-dialog.component';
import { Product } from '../../../../products/model/product.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { TableService } from '../../restaurant-tables/services/table.service';

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss'],
})
export class OrderDialogComponent implements OnInit {
  // Datos del pedido
  orderId: string | null = null; // Pedido existente en Firestore
  createdOrderId: string | null = null; // Pedido recién confirmado
  status: OrderStatus = 'draft';
  isEditMode: boolean = false; // true = actualizar, false = crear

  // Items en memoria
  items: OrderItem[] = [];
  notes = '';
  loading = false;

  // Info de la mesa/restaurante
  restaurantId = '';
  tableId = '';
  tableNumber = 0;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ordersService: OrdersService,
    private dialogService: DialogService,
    private tableService: TableService,
    private auth: AuthService,
  ) {
    this.restaurantId = data.restaurantId;
    this.tableId = data.tableId;
    this.tableNumber = data.tableNumber;
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

  // =====================================
  // Cargar pedido existente
  // =====================================
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

  // =====================================
  // Agregar item en memoria usando diálogo
  // =====================================
  addItemDialog() {
    const dialogRef = this.dialog.open(MenuDialogComponent, {
      width: '600px',
      data: { restaurantId: this.restaurantId },
    });

    dialogRef.afterClosed().subscribe((product) => {
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
    });
  }

  getProductPrice(product: Product): number {
    return product.isOffer
      ? product.offerPrice ?? product.price
      : product.price;
  }

  // =====================================
  // Eliminar item en memoria
  // =====================================
  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  // =====================================
  // Calcular total
  // =====================================
  getTotal(): number {
    return this.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }

  // =====================================
  // Crear pedido directamente aprobado (mozo)
  // =====================================
  async createOrder() {
    const waiter = this.auth.getUserID() ?? 'unknown';

    const orderId = await this.ordersService.createOrderForMozo(
      this.restaurantId,
      {
        tableId: this.tableId,
        tableNumber: this.tableNumber, // ✔️ CORRECTO
        createdBy: waiter,
        waiter,
        notes: this.notes,
        items: this.items, // los items finales
      }
    );
      // 🔹 NUEVO: asignar mesa
  await this.tableService.assignOrderToTable(this.restaurantId, this.tableId, orderId);


    // Cerrar diálogo y pasar el orderId creado
    this.dialogRef.close(orderId);
  }

  // =====================================
  // Actualizar pedido existente (modificación de items → updated)
  // =====================================
  async updateOrder() {
    const targetOrderId = this.createdOrderId || this.orderId;
    if (!targetOrderId) return;

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

  // =====================================
  // Confirmar pedido → delega a crear o actualizar
  // =====================================
  async confirmOrder() {
    if (this.isEditMode) {
      await this.updateOrder();
    } else {
      await this.createOrder();
    }
  }

  // =====================================
  // Cerrar pedido → seleccionar método de pago
  // =====================================
async closeOrder() {
  const dialogRef = this.dialog.open(PaymentMethodDialogComponent, {
    data: { orderTotal: this.getTotal() },
  });

  const result = await dialogRef.afterClosed().toPromise();
  if (!result) return;

  this.loading = true;

  try {
    const status = this.mapPaymentToStatus(result.method);
    
    // 1️⃣ Actualizar el estado del pedido
    await this.ordersService.updateOrderStatus(
      this.restaurantId,
      this.createdOrderId || this.orderId!,
      status,
      'mozo'
    );

    // 2️⃣ Liberar la mesa automáticamente
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

  mapPaymentToStatus(method: string): OrderStatus {
    return 'closed'; // aquí podrías mapear según tu modelo cerrado
  }

  cancel() {
    this.dialogRef.close({ created: false });
  }

  isMobile = window.innerWidth <= 768;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }
}
