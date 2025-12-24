import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { OrderStatus } from '../../models/order.model';
import { OrderStatusService } from '../../status/order-status/order-status.service';
import { ORDER_STATUS_CONFIG } from '../../status/model/order.status.model';

@Component({
  selector: 'app-order-dialog-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-dialog-header.component.html',
  styleUrls: ['./order-dialog-header.component.scss'],
})
export class OrderDialogHeaderComponent implements OnChanges {
  @Input() tableNumbers: number[] = [];
  @Input() status?: OrderStatus;
  @Input() currentTable?: number;

  @Output() addItem = new EventEmitter<void>();
  @Output() updateOrder = new EventEmitter<void>();
  @Output() cancelOrder = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  canUpdate = false;
  canCancel = false;

  constructor(private orderStatusService: OrderStatusService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['status'] && this.status) {
      this.canUpdate = this.orderStatusService.canUpdate(this.status);
      this.canCancel = this.orderStatusService.canCancel(this.status);
    } else {
      this.canUpdate = false;
      this.canCancel = false;
    }
  }

  get showMenu(): boolean {
    return this.canUpdate || this.canCancel;
  }

  get tableLabel(): string {
    if (!this.tableNumbers?.length) return '---';
    if (this.tableNumbers.length === 1) return `Mesa ${this.tableNumbers[0]}`;
    if (this.currentTable) return `Mesas ${this.tableNumbers.join(', ')} (desde mesa ${this.currentTable})`;
    return `Mesas ${this.tableNumbers.join(', ')}`;
  }

  get tableIcon(): string {
    if (this.tableNumbers.length === 1) return 'person';
    if (this.tableNumbers.length === 2) return 'groups';
    return 'people';
  }

  get statusLabel(): string {
    return this.status ? this.orderStatusService.getLabel(this.status) : 'Cargando...';
  }

  get statusColor(): string {
    return this.status ? ORDER_STATUS_CONFIG[this.status]?.color || 'gray' : 'gray';
  }
}
