import { Injectable } from '@angular/core';
import { OrderStatus } from '../../../features/order/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderStatusService {

  private readonly map: Record<OrderStatus, string> = {
    draft: 'Borrador',
    approved: 'Aprobado',
    preparing: 'En preparación',
    ready: 'Listo para entregar',
    closed: 'Cerrado',
    cancelled: 'Cancelado',
    updated: 'Actualizado',
    pending: 'Pendiente',
    update_rejected: 'Actualización Rechazada',
    delivered: 'Entregado',
    closed_cash: 'Pago en efectivo',
    closed_qr: 'Pago con QR',
    closed_mp_pos: 'Pago con POS',
    closed_credit: 'Pago con tarjeta de credito',
    closed_debit: 'Pago con tarjeta de debito',
    closed_other: 'Pago con otros metodos de pago'
  };

  getOrderStatusLabel(status: OrderStatus | string): string {
    return this.map[status as OrderStatus] ?? 'Desconocido';
  }
}
