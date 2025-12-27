import { Injectable } from '@angular/core';
import { ORDER_STATUS_CONFIG } from '../model/order.status.model';
import { OrderStatus } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderStatusService {
  getConfig(status: OrderStatus) {
    return ORDER_STATUS_CONFIG[status];
  }

  getLabel(status: OrderStatus): string {
    return this.getConfig(status)?.label ?? '—';
  }

  getKitchenLabel(status: OrderStatus): string | null {
    return this.getConfig(status)?.kitchenLabel ?? null;
  }

  canUpdate(status: OrderStatus): boolean {
    return this.getConfig(status)?.canUpdate ?? false;
  }

  canCancel(status: OrderStatus): boolean {
    return this.getConfig(status)?.canCancel ?? false;
  }

  isVisibleInKitchen(status: OrderStatus): boolean {
    return this.getConfig(status)?.visibleInKitchen ?? false;
  }

  getColor(status: OrderStatus): string {
    return this.getConfig(status)?.color ?? 'default';
  }
}
