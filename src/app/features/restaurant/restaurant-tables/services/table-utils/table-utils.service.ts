import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableQrDialogComponent } from '../../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';
import { Table } from '../../model/tables.model';
import { TableService } from '../table.service';
import { Order } from '../../../../order/models/order.model';
import { OrderStatusService } from '../../../../order/status/order-status/order-status.service';

@Injectable({ providedIn: 'root' })
export class TableUtilsService {
  constructor(
    private tableService: TableService,
    private dialog: MatDialog,
    private orderStatusService: OrderStatusService
  ) {}

  onSearch(tables: Table[], searchTerm: string): Table[] {
    if (!searchTerm) return [...tables];
    const term = searchTerm.toLowerCase();
    return tables.filter(
      t =>
        t.number.toString().includes(term) ||
        t.name?.toLowerCase().includes(term) ||
        t.sector?.toLowerCase().includes(term)
    );
  }

  changeStatus(restaurantId: string, table: Table, status: Table['status']) {
    this.tableService.updateTable(restaurantId, table.tableId, { status });
  }

  openQr(table: Table, restaurantSlug: string) {
    const url = `https://palex-4a139.web.app/r/${restaurantSlug}/menu/${table.tableId}`;
    this.dialog.open(TableQrDialogComponent, {
      data: { table, url, logoUrl: 'assets/img/logo-palex.png' },
    });
  }

  getOrderForTable(table: Table, ordersMap: Map<string, Order>): Order | null {
    if (!table.currentOrderId) return null;
    return ordersMap.get(table.currentOrderId) ?? null;
  }

  getOrderStatusColor(table: Table, ordersMap: Map<string, Order>): string {
    const order = this.getOrderForTable(table, ordersMap);
    if (!order) return 'transparent';
    return this.orderStatusService.getColor(order.status);
  }

  getOrderStatusLabel(table: Table, ordersMap: Map<string, Order>): string {
    const order = this.getOrderForTable(table, ordersMap);
    return order ? this.orderStatusService.getLabel(order.status) : '';
  }
}
