import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-order-items-table',
  imports: [SharedModule],
  templateUrl: './order-items-table.component.html',
  styleUrls: ['./order-items-table.component.scss'],
})
export class OrderItemsTableComponent {
  @Input() items: any[] = [];
  @Output() remove = new EventEmitter<number>();
  @Output() quantityChange = new EventEmitter<void>();

  displayedColumns = ['name', 'qty', 'price', 'subtotal', 'actions'];
  dataSource = new MatTableDataSource<any>();

  ngOnChanges() {
    this.dataSource.data = this.items;
  }

  onRemove(index: number) {
    this.remove.emit(index);
  }

  onQuantityChange() {
    this.quantityChange.emit();
  }
}
