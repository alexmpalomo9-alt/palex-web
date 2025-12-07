import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Table } from '../model/tables.model';
import { Restaurant } from '../../model/restaurant.model';
import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';
import { OrdersService } from '../../../order/services/order.service';
import { TableService } from '../services/table.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { SharedModule } from '../../../../shared/shared.module';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-tables-card',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './restaurant-tables-card.component.html',
  styleUrls: ['./restaurant-tables-card.component.scss'],
})
export class RestaurantTablesCardComponent implements OnInit, OnDestroy {
  restaurantId!: string;
  @Input() restaurant: Restaurant | null = null;

  tables: Table[] = [];
  loading = true;

  private sub!: Subscription;

  constructor(
    private tableService: TableService,
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('restaurantId');
    if (!slug) return;

    this.sub = this.restaurantService
      .getRestaurantBySlug(slug)
      .subscribe((restaurant) => {
        if (!restaurant) return;

        this.restaurant = restaurant;
        this.restaurantId = restaurant.restaurantId; // ✔️ ASIGNAR RESTAURANT ID

        this.sub = this.tableService
          .getTablesByRestaurant(this.restaurant.restaurantId)
          .subscribe((tables) => {
            this.tables = tables || [];
            this.loading = false;
          });
      });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  // cambiar status de la mesa
  changeStatus(table: Table, status: 'available' | 'occupied' | 'reserved') {
    if (!this.restaurant) return;
    this.tableService.updateTable(
      this.restaurant.restaurantId,
      table.tableId!,
      {
        status,
      }
    );
  }

  // abrir QR dialog
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

  // Ver o crear pedido según estado de la mesa
  async viewOrder(orderId: string | null, table: Table) {
    if (!this.restaurant) return;

    let currentOrderId = orderId;

    // Abrir diálogo con pedido existente o nuevo en memoria
    this.dialog.open(OrderDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        restaurantId: this.restaurant.restaurantId,
        orderId: currentOrderId, // null si es nuevo
        tableId: table.tableId,
        number: table.number,
        isNew: !orderId, // diálogo manejará el borrador en memoria
      },
    });
  }
}
