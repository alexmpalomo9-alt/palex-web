import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrderItem } from '../../../order/models/order.model';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-order-items-mobile',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-item-mobile.component.html',
  styleUrls: ['./order-item-mobile.component.scss'],
})
export class OrderItemsMobileComponent {
  @Input() items: OrderItem[] = [];
  @Output() remove = new EventEmitter<number>();

  removeItem(i: number) {
    this.remove.emit(i);
  }
}
