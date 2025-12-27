import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subject, Subscription } from 'rxjs';

import { Table } from '../model/tables.model';
import { Restaurant } from '../../model/restaurant.model';
import { Order } from '../../../order/models/order.model';

import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';
import { SelectTablesDialogComponent } from '../../../order/components/select-tables-dialog/select-tables-dialog.component';

import { TableService } from '../services/table.service';
import { RestaurantService } from '../../services/restaurant.service';
import { OrderService } from '../../../order/services/order-service/order.service';
import { TableUtilsService } from '../services/table-utils/table-utils.service';
import { OrderUtilsService } from '../services/order-utils/order-utils.service';
import { TableStatusService } from '../services/table-status/table-status.service';
import { OrderStatusService } from '../../../order/status/order-status/order-status.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../../shared/shared.module';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SectionHeaderComponent } from '../../shared/section-header/section-header/section-header.component';

@Component({
  selector: 'app-restaurant-tables-card',
  standalone: true,
  imports: [
    SharedModule,
    SectionHeaderComponent,
    AddButtonComponent,
    MatTooltipModule,
  ],
  templateUrl: './restaurant-tables-card.component.html',
  styleUrls: ['./restaurant-tables-card.component.scss'],
})
export class RestaurantTablesCardComponent implements OnInit, OnDestroy {
  @Input() restaurant: Restaurant | null = null;

  restaurantId!: string;
  tables: Table[] = [];
  filteredTables: Table[] = [];
  loading = true;

  ordersMap: Map<string, Order> = new Map();
  private sub!: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private tableService: TableService,
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private tableUtilsService: TableUtilsService,
    private orderUtilsService: OrderUtilsService,
    public tableStatusService: TableStatusService,
    public orderStatusService: OrderStatusService
  ) {}

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('restaurantId');
    if (!slug) return;

    this.sub = this.restaurantService
      .getRestaurantBySlug(slug)
      .subscribe((restaurant) => {
        if (!restaurant) return;

        this.restaurant = restaurant;
        this.restaurantId = restaurant.restaurantId;

        this.sub = this.tableService
          .getTablesByRestaurant(this.restaurantId)
          .subscribe((tables) => {
            this.tables = tables ?? [];
            this.filteredTables = [...this.tables];
            this.loading = false;
            this.loadActiveOrders();
          });
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =======================
  // Búsqueda
  // =======================
  onSearch(searchTerm: string) {
    this.filteredTables = this.tableUtilsService.onSearch(
      this.tables,
      searchTerm
    );
  }

  // =======================
  // Estado de la mesa
  // =======================
  changeStatus(table: Table, status: Table['status']) {
    if (!this.restaurant) return;
    this.tableUtilsService.changeStatus(
      this.restaurant.restaurantId,
      table,
      status
    );
  }

  getTableStatusLabel(table: Table): string {
    return this.tableStatusService.getTableStatusLabel(table);
  }

  getTableStatusColor(table: Table): string {
    return this.tableStatusService.getTableStatusColor(table);
  }

  // =======================
  // Pedidos
  // =======================
  async loadActiveOrders() {
    if (!this.restaurantId) return;
    const orders = await this.orderService.getActiveOrdersByRestaurant(
      this.restaurantId
    );
    this.ordersMap.clear();
    orders.forEach((o) => {
      if (o.orderId) this.ordersMap.set(o.orderId, o);
    });
  }

  getOrderForTable(table: Table): Order | null {
    return this.tableUtilsService.getOrderForTable(table, this.ordersMap);
  }

  getUpdateMessage(
    table: Table
  ): { text: string; type: 'accepted' | 'rejected' } | null {
    const order = this.getOrderForTable(table);
    if (!order?.lastUpdateDecision) return null;
    return {
      text:
        order.lastUpdateDecision === 'accepted'
          ? 'Los cambios fueron aceptados'
          : 'Los cambios fueron rechazados, el pedido original continua en proceso',
      type: order.lastUpdateDecision,
    };
  }

  hasActiveOrder(table: Table): boolean {
    return !!table.currentOrderId && this.ordersMap.has(table.currentOrderId);
  }

  // =======================
  // QR
  // =======================
  openQr(table: Table) {
    if (!this.restaurant) return;
    this.tableUtilsService.openQr(table, this.restaurant.slug);
  }

  // =======================
  // Ver o crear pedido
  // =======================
  viewOrder(orderId: string | null, table: Table) {
    if (!this.restaurant) return;
    this.orderUtilsService.viewOrder(
      this.restaurant.restaurantId,
      orderId,
      table,
      this.selectTablesForNewOrder.bind(this)
    );
  }

  async selectTablesForNewOrder(baseTable: Table): Promise<Table[]> {
    const dialogRef = this.dialog.open(SelectTablesDialogComponent, {
      width: '400px',
      data: { tables: this.tables, baseTable },
    });

    return (await firstValueFrom(dialogRef.afterClosed())) ?? [];
  }

  async createOrderFromMenu() {
    if (!this.restaurant) return;

    const selectRef = this.dialog.open(SelectTablesDialogComponent, {
      data: { tables: this.tables, baseTable: null },
    });

    const selectedTables: Table[] = await firstValueFrom(
      selectRef.afterClosed()
    );
    if (!selectedTables?.length) return;

    const orderRef = this.dialog.open(OrderDialogComponent, {
      disableClose: true,
      data: {
        restaurantId: this.restaurant.restaurantId,
        orderId: null,
        tableIds: selectedTables.map((t) => t.tableId),
        tableNumbers: selectedTables.map((t) => t.number),
        isNew: true,
      },
    });

    orderRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.snackBar.open('Pedido creado correctamente', 'OK', {
          duration: 3000,
        });
        this.loadActiveOrders();
      }
    });
  }
}
