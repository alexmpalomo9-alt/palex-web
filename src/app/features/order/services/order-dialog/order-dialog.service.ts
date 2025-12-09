// order-dialog.service.ts
import { Injectable } from '@angular/core';
import { DialogService } from '../../../../core/services/dialog.service'; // Asegúrate de que la ruta sea correcta
import { OrderItem, OrderStatus } from '../../../order/models/order.model';
import { TableService } from '../../../restaurant/restaurant-tables/services/table.service';
import { OrderService } from '../order-service/order.service';

@Injectable({
  providedIn: 'root',
})
export class OrderDialogService {
  constructor(
    private orderService: OrderService,
    private tableService: TableService,
    private dialogService: DialogService
  ) {}

  // ==========================
  // LOAD ORDER
  // ==========================
  async loadOrder(restaurantId: string, orderId: string) {
    try {
      const order = await this.orderService.getOrderWithItems(
        restaurantId,
        orderId
      );

      const items: OrderItem[] = (order.items || []).map((i: any) => ({
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

      return {
        items,
        notes: order.notes || '',
        status: order.status,
        originalItems: items.map((i) => ({ ...i })), // clon profundo
        originalNotes: order.notes || '',
      };
    } catch (error: any) {
      this.dialogService.errorDialog('Error al cargar pedido', error.message);
      throw error;
    }
  }

  // Crear un nuevo pedido
  async createOrder(data: any) {
    try {
      const orderId = await this.orderService.createOrderForMozo(
        data.restaurantId, // ARG 1
        {
          tableId: data.tableId,
          tableNumber: data.tableNumber,
          createdBy: data.createdBy,
          waiter: data.waiter,
          notes: data.notes,
          items: data.items,
        } // ARG 2
      );

      await this.tableService.assignOrderToTable(
        data.restaurantId,
        data.tableId,
        orderId
      );

      return orderId;
    } catch (error: any) {
      this.dialogService.errorDialog('Error', error.message);
      throw error;
    }
  }

  // Actualizar un pedido existente
  async updateOrder(data: any) {
    try {
      await this.orderService.updateOrder(
        data.restaurantId,
        data.orderId,
        data.items,
        data.notes,
        'mozo'
      );
    } catch (error: any) {
      this.dialogService.errorDialog('Error', error.message);
      throw error;
    }
  }

  // Cancelar un pedido
  async cancelOrder(data: any) {
    try {
      await this.orderService.cancelOrder(
        data.restaurantId,
        data.orderId,
        data.userId
      );
      await this.tableService.clearTable(data.restaurantId, data.tableId);
    } catch (error: any) {
      this.dialogService.errorDialog('Error', error.message);
      throw error;
    }
  }

  // Cerrar un pedido
  async closeOrder(data: any) {
    try {
      const status = this.mapPaymentToStatus(data.paymentMethod);
      await this.orderService.updateOrderStatus(
        data.restaurantId,
        data.orderId,
        status,
        'mozo'
      );
      await this.tableService.clearTable(data.restaurantId, data.tableId);
    } catch (error: any) {
      this.dialogService.errorDialog('Error', error.message);
      throw error;
    }
  }

  // Mapeo de método de pago a estado del pedido
  private mapPaymentToStatus(paymentMethod: string): OrderStatus {
    return 'closed'; // Aquí puedes agregar la lógica según el método de pago
  }

  // ==========================
// DETECTAR CAMBIOS EN EL PEDIDO
// ==========================
hasChanges(
  currentItems: OrderItem[],
  originalItems: OrderItem[],
  currentNotes: string,
  originalNotes: string
): boolean {
  
  // 1. Cambio en las notas
  if (currentNotes !== originalNotes) return true;

  // 2. Cambio en la cantidad de items
  if (currentItems.length !== originalItems.length) return true;

  // 3. Cambios item por item
  for (let i = 0; i < currentItems.length; i++) {
    const c = currentItems[i];
    const o = originalItems[i];

    if (
      c.qty !== o.qty ||
      c.price !== o.price ||
      c.notes !== o.notes ||
      c.productId !== o.productId
    ) {
      return true;
    }
  }

  return false;
}

}
