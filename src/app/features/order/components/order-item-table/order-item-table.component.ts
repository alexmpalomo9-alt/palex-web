import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrderItem } from '../../../order/models/order.model';
import { SharedModule } from '../../../../shared/shared.module';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-order-items-table',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-item-table.component.html',
  styleUrls: ['./order-item-table.component.scss'],
})
export class OrderItemsTableComponent {
  @Input() set items(value: OrderItem[]) {
    this._items = value;
    this.dataSource.data = value;
  }
  get items() { return this._items; }
  private _items: OrderItem[] = [];

  @Output() remove = new EventEmitter<number>();

  displayedColumns = ['name', 'qty', 'price', 'subtotal', 'actions'];
  dataSource = new MatTableDataSource<OrderItem>();

  removeItem(index: number) {
    this.remove.emit(index);
  }
}
