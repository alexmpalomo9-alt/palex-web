import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { Table } from '../model/tables.model';
import { Restaurant } from '../../model/restaurant.model';

import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';

import { TableService } from '../services/table.service';
import { RestaurantService } from '../../services/restaurant.service';
import { TableStatusService } from '../../../../shared/services/table-status/table-status.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-restaurant-tables-card',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './restaurant-tables-card.component.html',
  styleUrls: ['./restaurant-tables-card.component.scss'],
})
export class RestaurantTablesCardComponent implements OnInit, OnDestroy {
  @Input() restaurant: Restaurant | null = null;

  restaurantId!: string;
  tables: Table[] = [];
  loading = true;
  isDarkMode = false;

  private sub!: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private tableService: TableService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public tableStatusService: TableStatusService,
    private themeService: ThemeService
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
            this.tables = tables || [];
            this.loading = false;
          });
      });
    // Escuchar cambios del tema
    this.themeService.darkModeObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.isDarkMode = value;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cambiar estado manualmente
  changeStatus(table: Table, status: Table['status']) {
    if (!this.restaurant) return;

    this.tableService.updateTable(this.restaurant.restaurantId, table.tableId, {
      status,
    });
  }

  // Ver QR
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

  // Ver / crear pedido
  viewOrder(orderId: string | null, table: Table) {
    if (!this.restaurant) return;

    // Crear pedido SOLO si status es available o seated
    const canCreateOrder =
      table.status === 'available' || table.status === 'seated';

    // Si NO hay pedido y NO está en estados permitidos → bloquear
    if (!orderId && !canCreateOrder) {
      alert('La mesa no está disponible para crear un pedido.');
      return;
    }

    // Abrir diálogo
    this.dialog.open(OrderDialogComponent, {
      disableClose: true,
      data: {
        restaurantId: this.restaurant.restaurantId,
        orderId,
        tableId: table.tableId,
        tableNumber: table.number,
        isNew: !orderId,
      },
    });
  }
}
