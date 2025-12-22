import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { OrderStatus } from '../../models/order.model';

@Component({
  standalone: true,
  selector: 'app-order-dialog-footer',
  templateUrl: './order-dialog-footer.component.html',
  styleUrls: ['./order-dialog-footer.component.scss'],
  imports: [SharedModule, AddButtonComponent],
})
export class OrderDialogFooterComponent {

  @Input() status!: OrderStatus;
  @Input() loading = false;

  @Output() create = new EventEmitter<void>();
  @Output() markDelivered = new EventEmitter<void>();
  @Output() closeOrder = new EventEmitter<void>();

  get canCreate(): boolean {
    return this.status === 'draft';
  }

  get canDeliver(): boolean {
    return this.status === 'ready';
  }

  get canClose(): boolean {
    return this.status === 'delivered';
  }
}
