import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Table } from '../model/tables.model';
import { Restaurant } from '../../model/restaurant.model';
import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';
import { OrdersService } from '../../../order/services/order.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { RestaurantService } from '../../services/restaurant.service';
import { TableDialogService } from '../services/table-dialog/table-dialog.service';
import { TableService } from '../services/table.service';

@Component({
  selector: 'app-restaurant-tables-card',
  imports: [SharedModule],
  templateUrl: './restaurant-tables-card.component.html',
  styleUrls: ['./restaurant-tables-card.component.scss'],
})
export class RestaurantTablesCardComponent implements OnInit, OnDestroy {
  restaurantId!: string; // viene del auth o del contexto
  @Input() restaurant: Restaurant | null = null;

  tables: Table[] = [];
  loading = true;

  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private restaurantService: RestaurantService,
    private orderService: OrdersService,
    private dialog: MatDialog,
    private dialogService: DialogService
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

        this.loadTables();
      });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  /** Cargar mesas del restaurante */
  loadTables() {
    if (!this.restaurantId) return;

    this.loading = true;

    this.tableService
      .getTablesByRestaurant(this.restaurantId)
      .subscribe((tables) => {
        this.tables = tables;
        this.loading = false;
      });
  }

  changeStatus(table: Table, status: 'available' | 'occupied' | 'reserved') {
    this.tableService.updateTable(this.restaurantId, table.tableId!, {
      status,
    });
  }

  openQr(table: Table) {
    const url = `https://palex-4a139.web.app/r/${this.restaurant?.slug}/menu/${table.tableId}`;

    this.dialog.open(TableQrDialogComponent, {
      data: {
        table,
        url,
        logoUrl: 'assets/img/logo-palex.png',
      },
    });
  }

  // ============================================================
  // 🔵 Ver Pedido
  // ============================================================

  /** 🔵 Ver o crear pedido según estado de la mesa */
  async viewOrder(orderId: string | null, table: Table) {
    if (!this.restaurant) return;

    let currentOrderId = orderId;
    if (!orderId) {
      // Mesa libre → crear nuevo pedido
      try {
        currentOrderId = await this.orderService.createOrder(
          this.restaurant.restaurantId,
          table.tableId!,
          table.number
        );
      } catch (e: any) {
        this.dialogService.errorDialog(
          'Error al crear pedido',
          e.message || 'No se pudo iniciar el pedido.'
        );
        return;
      }
    }

    // Abrir diálogo con pedido existente o recién creado
    this.dialog.open(OrderDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        restaurantId: this.restaurant.restaurantId,
        orderId: currentOrderId,
        tableId: table.tableId,
        number: table.number,
        isNew: !orderId,
      },
    });
  }
}
