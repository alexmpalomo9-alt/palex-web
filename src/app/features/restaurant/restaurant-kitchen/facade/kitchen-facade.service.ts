import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Order, OrderItem } from '../../../order/models/order.model';
import { OrderService } from '../../../order/services/order-service/order.service';

export interface KitchenOrder {
  orderId: string;
  tableNumbers: number[];
  waiterName: string;
  total: number;
  items: OrderItem[];
  notes: string;
  statusLabel: 'Nuevo' | 'Actualizado' | null;
}

@Injectable({ providedIn: 'root' })
export class KitchenFacade {
  private changedOrders = new Map<string, { statusLabel: 'Nuevo' | 'Actualizado' | null }>();

  constructor(private orderService: OrderService) {}

  getActiveOrders(restaurantId: string): Observable<KitchenOrder[]> {
    return this.orderService.getActiveOrdersWithItemsRealtime(restaurantId).pipe(
      map((orders) =>
        orders.map((o) => {
          let label: 'Nuevo' | 'Actualizado' | null = null;
          if (o.status === 'approved') label = 'Nuevo';
          else if (o.status === 'updated') label = 'Actualizado';

          this.changedOrders.set(o.orderId, { statusLabel: label });

          return {
            orderId: o.orderId,
            tableNumbers: o.tableNumbers ?? [],
            waiterName: o.waiterName ?? 'Sin asignar',
            total: o.total ?? 0,
            items: o.items ?? [],
            notes: o.notes ?? '',
            statusLabel: label,
          };
        })
      )
    );
  }

  getOrderStatusLabel(orderId: string) {
    return this.changedOrders.get(orderId)?.statusLabel ?? null;
  }
}
