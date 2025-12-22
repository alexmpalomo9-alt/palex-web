import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-dialog-header',
  standalone: true,
  imports: [SharedModule, AddButtonComponent],
  templateUrl: './order-dialog-header.component.html',
  styleUrls: ['./order-dialog-header.component.scss'],
})
export class OrderDialogHeaderComponent {
  @Input() tableNumbers: number[] = [];
  @Input() status!: OrderStatus;
  @Input() currentTable?: number;

  @Output() addItem = new EventEmitter<void>();
  @Output() updateOrder = new EventEmitter<void>();
  @Output() cancelOrder = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get canUpdate(): boolean {
    return ['approved', 'preparing', 'updated'].includes(this.status);
  }

  get canCancel(): boolean {
    return ['pending', 'approved', 'preparing', 'updated', 'ready'].includes(
      this.status
    );
  }

  get showMenu(): boolean {
    return this.canUpdate || this.canCancel;
  }

  get tableLabel(): string {
    if (!this.tableNumbers?.length) return '---';

    if (this.tableNumbers.length === 1) {
      return `Mesa ${this.tableNumbers[0]}`;
    }

    if (this.currentTable) {
      return `Mesas ${this.tableNumbers.join(', ')} (desde mesa ${
        this.currentTable
      })`;
    }

    return `Mesas ${this.tableNumbers.join(', ')}`;
  }

  get tableIcon(): string {
    if (this.tableNumbers.length === 1) return 'person';
    if (this.tableNumbers.length === 2) return 'groups';
    return 'people'; // 3 o más mesas
  }

  get statusLabel(): string {
    const map: Record<OrderStatus, string> = {
      draft: 'Borrador',
      pending: 'Pendiente',
      updated: 'Modificado',
      update_rejected: 'Modificación rechazada',
      approved: 'Aprobado',
      preparing: 'En preparación',
      ready: 'Listo para entregar',
      delivered: 'Entregado',
      closed: 'Cerrado',
      closed_cash: 'Cerrado (Efectivo)',
      closed_qr: 'Cerrado (QR)',
      closed_mp_pos: 'Cerrado (MP POS)',
      closed_credit: 'Cerrado (Crédito)',
      closed_debit: 'Cerrado (Débito)',
      closed_other: 'Cerrado',
      cancelled: 'Cancelado',
    };

    return map[this.status] ?? '';
  }
}
