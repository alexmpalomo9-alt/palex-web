import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subject, Subscription, takeUntil } from 'rxjs';

import { Table } from '../model/tables.model';
import { Restaurant } from '../../model/restaurant.model';

import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';

import { TableService } from '../services/table.service';
import { RestaurantService } from '../../services/restaurant.service';
import { TableStatusService } from '../../../../shared/services/table-status/table-status.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { SelectTablesDialogComponent } from '../../../order/components/select-tables-dialog/select-tables-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectionHeaderComponent } from '../../shared/section-header/section-header/section-header.component';

@Component({
  selector: 'app-restaurant-tables-card',
  standalone: true,
  imports: [SharedModule, SectionHeaderComponent],
  templateUrl: './restaurant-tables-card.component.html',
  styleUrls: ['./restaurant-tables-card.component.scss'],
})
export class RestaurantTablesCardComponent implements OnInit, OnDestroy {
  @Input() restaurant: Restaurant | null = null;

  restaurantId!: string;
  tables: Table[] = [];
  filteredTables: Table[] = [];
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
    private themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('restaurantId');
    if (!slug) return;

    // Cargar restaurante y mesas
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
            this.filteredTables = [...this.tables]; // Inicialmente mostrar todas
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

  // ================================
  // BUSCADOR DE MESAS
  // ================================
  onSearch(searchTerm: string) {
    if (!searchTerm) {
      this.filteredTables = [...this.tables];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredTables = this.tables.filter(
      (t) =>
        t.number.toString().includes(term) ||
        (t.name?.toLowerCase().includes(term) ?? false) ||
        (t.sector?.toLowerCase().includes(term) ?? false)
    );
  }

  // ================================
  // CAMBIO DE ESTADO
  // ================================
  changeStatus(table: Table, status: Table['status']) {
    if (!this.restaurant) return;

    this.tableService.updateTable(this.restaurant.restaurantId, table.tableId, {
      status,
    });
  }

  // ================================
  // VER QR
  // ================================
  openQr(table: Table) {
    const url = `https://palex-4a139.web.app/r/${this.restaurant?.slug}/menu/${table.tableId}`;
    this.dialog.open(TableQrDialogComponent, {
      data: { table, url, logoUrl: 'assets/img/logo-palex.png' },
    });
  }

  // ================================
  // VER / CREAR PEDIDO
  // ================================
  async viewOrder(orderId: string | null, table: Table) {
    if (table.currentOrderId) orderId = table.currentOrderId;

    if (!orderId) {
      const canCreate = table.status === 'available' || table.status === 'seated';
      if (!canCreate) {
        return alert(`Mesa ${table.number} no disponible`);
      }
    }

    let selectedTables: Table[] = [];
    if (orderId) {
      selectedTables = [table];
    } else {
      selectedTables = await this.selectTablesForNewOrder(table);
      if (!selectedTables.length) return;
    }

    const dialogRef = this.dialog.open(OrderDialogComponent, {
      disableClose: true,
      data: {
        restaurantId: this.restaurant!.restaurantId,
        orderId,
        tableIds: selectedTables.map((t) => t.tableId),
        tableNumbers: selectedTables.map((t) => t.number),
        isNew: !orderId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.snackBar.open('Pedido creado correctamente', 'OK', { duration: 3000 });
      }
    });
  }

  // ================================
  // CREAR PEDIDO DESDE BOTÓN SUPERIOR
  // ================================
  async createOrderFromMenu() {
    if (!this.restaurant) return;

    const selectRef = this.dialog.open(SelectTablesDialogComponent, {
      data: { tables: this.tables, baseTable: null },
    });

    const selectedTables: Table[] = await firstValueFrom(selectRef.afterClosed());
    if (!selectedTables || !selectedTables.length) return;

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
        this.snackBar.open('Pedido creado correctamente', 'OK', { duration: 3000 });
      }
    });
  }

  // ================================
  // SELECCIONAR MESAS PARA NUEVO PEDIDO
  // ================================
  async selectTablesForNewOrder(baseTable: Table): Promise<Table[]> {
    const dialogRef = this.dialog.open(SelectTablesDialogComponent, {
      width: '400px',
      data: { tables: this.tables, baseTable },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    return result ?? [];
  }
}
