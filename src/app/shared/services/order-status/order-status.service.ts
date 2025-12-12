import { Injectable } from '@angular/core';
import { OrderStatus } from '../../../features/order/models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderStatusService {
  constructor() {}

  getOrderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending':
        return 'Pendiente';
      case 'updated':
        return 'Actualizado';
      case 'update_rejected':
        return 'Modificación rechazada';
      case 'approved':
        return 'Aprobado';
      case 'preparing':
        return 'En preparación';
      case 'ready':
        return 'Listo para entregar';
      case 'delivered':
        return 'Entregado';
      case 'closed':
        return 'Finalizado';
      case 'closed_cash':
      case 'closed_qr':
      case 'closed_mp_pos':
      case 'closed_credit':
      case 'closed_debit':
      case 'closed_house':
      case 'closed_other':
        return ''; // No mostrar cuando se cierra
      case 'cancelled':
        return 'Cancelado';
      default:
        return status; // Por si llega un valor no contemplado
    }
  }
}
