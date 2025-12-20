import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OrderItem, OrderStatus } from '../../../order/models/order.model';
import { KitchenService } from '../services/kitchen.service';

/* =====================================================
   🔹 MODELO QUE USA LA UI DE COCINA
===================================================== */
export interface KitchenOrder {
  orderId: string;
  tableNumbers: number[];
  waiterName: string;
  total: number;
  items: OrderItem[];
  notes: string;

  // 🔹 UI
  status: OrderStatus; 
  // 🔹 Tiempos
  createdAt: any;
  updatedAt?: any;
  preparingAt?: any;
  readyAt?: any;
}

@Injectable({ providedIn: 'root' })
export class KitchenFacade {
  constructor(private kitchenService: KitchenService) {}

  /* =====================================================
     📡 PEDIDOS ACTIVOS
  ===================================================== */

  getActiveOrders(restaurantId: string): Observable<KitchenOrder[]> {
    return this.kitchenService
      .getActiveOrdersWithItemsRealtime(restaurantId)
      .pipe(
        map((orders) =>
          orders.map((o) => ({
            orderId: o.orderId,
            tableNumbers: o.tableNumbers ?? [],
            waiterName: o.waiterName ?? 'Sin asignar',
            total: o.total ?? 0,
            items: o.items ?? [],
            notes: o.notes ?? '',
            status: o.status,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
            preparingAt: (o as any).preparingAt,
            readyAt: (o as any).readyAt,
          }))
        )
      );
  }

  /* =====================================================
     🍳 ACCIONES
  ===================================================== */

  markPreparing(
    restaurantId: string,
    orderId: string,
    userId: string | null
  ) {
    return this.kitchenService.markPreparing(
      restaurantId,
      orderId,
      userId
    );
  }

  markReady(
    restaurantId: string,
    orderId: string,
    userId: string | null
  ) {
    return this.kitchenService.markReady(
      restaurantId,
      orderId,
      userId
    );
  }
}
