import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, from, filter, switchMap, takeUntil, tap } from 'rxjs';
import { Table } from '../model/tables.model';
import { TableService } from '../services/table.service';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { ActivatedRoute } from '@angular/router';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { TableDialogService } from '../services/table-dialog/table-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';
import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-restaurant-tables',
  templateUrl: './restaurant-tables.component.html',
  styleUrls: ['./restaurant-tables.component.scss'],
  imports: [SharedModule],
})
export class RestaurantTablesComponent implements OnInit, OnDestroy {
  restaurantId!: string;
  @Input() restaurant: Restaurant | null = null;

  tables: Table[] = [];
  loading = true;
  isDarkMode: boolean;
  displayedColumns: string[] = [
    'number',
    'name',
    'capacity',
    'status',
    'sector',
    'actions',
  ];

  private destroy$ = new Subject<void>();
  private tableService = inject(TableService);
  private restaurantService = inject(RestaurantService);
  private dialogService = inject(DialogService);
  private tableDialogService = inject(TableDialogService);
  private dialog = inject(MatDialog);
  private themeService = inject(ThemeService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.isDarkMode = this.themeService.getDarkMode();
  }

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('restaurantId');
    if (!slug) return;

    // 🔹 Cargar restaurante y luego mesas
    this.restaurantService
      .getRestaurantBySlug(slug)
      .pipe(
        takeUntil(this.destroy$),
        filter((r) => !!r),
        tap((r) => {
          this.restaurant = r!;
          this.restaurantId = r!.restaurantId;
        }),
        switchMap(() => this.loadTablesObservable())
      )
      .subscribe();

    this.subscribeTheme();
  }

  private subscribeTheme() {
    this.themeService.darkModeObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => (this.isDarkMode = value));
  }

  /** Cargar mesas (observable) */
  private loadTablesObservable() {
    if (!this.restaurantId) return from([[]]); // Retorna array vacío si no hay restaurante

    this.loading = true;
    return this.tableService.getTablesByRestaurant(this.restaurantId).pipe(
      tap((tables) => {
        this.tables = tables;
        this.loading = false;
      })
    );
  }

  loadTables() {
    this.loadTablesObservable().subscribe();
  }

  // ================================
  // ACCIONES DE MESAS
  // ================================

  openCreateTable() {
    if (!this.restaurant) return;
    this.tableDialogService
      .openTableDialog({ mode: 'create' })
      .pipe(
        takeUntil(this.destroy$),
        filter(Boolean),
        switchMap((result) =>
          from(
            this.tableService.createTable({
              ...result!,
              restaurantId: this.restaurant!.restaurantId,
            })
          )
        )
      )
      .subscribe({
        next: () =>
          this.dialogService.infoDialog('Éxito', 'Mesa creada correctamente.'),
        error: (e) =>
          this.dialogService.errorDialog(
            'Error',
            e?.message || 'Ocurrió un error inesperado.'
          ),
      });
  }

  openEditTable(table: Table) {
    if (!this.restaurant) return;
    this.tableDialogService
      .openTableDialog({ mode: 'edit', data: table })
      .pipe(
        takeUntil(this.destroy$),
        filter(Boolean),
        switchMap((result) => {
          const { restaurantId: _ignore, ...clean } = result!;
          return from(
            this.tableService.updateTable(
              this.restaurant!.restaurantId,
              table.tableId!,
              clean
            )
          );
        })
      )
      .subscribe({
        next: () =>
          this.dialogService.infoDialog(
            'Éxito',
            'Mesa actualizada correctamente.'
          ),
        error: (e) =>
          this.dialogService.errorDialog(
            'Error',
            e?.message || 'Ocurrió un error inesperado.'
          ),
      });
  }

  deleteTable(table: Table) {
    if (!table.tableId || !this.restaurant) return;
    this.dialogService
      .confirmDialog({
        title: '¿Eliminar Permanente?',
        message: 'Esta acción no se puede deshacer.',
        type: 'confirm',
      })
      .pipe(
        takeUntil(this.destroy$),
        filter(Boolean),
        switchMap(() =>
          from(
            this.tableService.deleteTable(
              this.restaurant!.restaurantId,
              table.tableId!
            )
          )
        )
      )
      .subscribe({
        next: () =>
          this.dialogService.infoDialog(
            'Éxito',
            'La mesa ha sido eliminada correctamente.'
          ),
        error: (e) =>
          this.dialogService.errorDialog(
            'Error',
            e?.message || 'Ocurrió un error inesperado.'
          ),
      });
  }

  changeStatus(table: Table, status: 'available' | 'occupied' | 'reserved') {
    if (!table.tableId) return;

    from(
      this.tableService.updateTable(this.restaurantId, table.tableId, {
        status,
      })
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          table.status = status;
        },
        error: (e) =>
          this.dialogService.errorDialog(
            'Error',
            e?.message || 'No se pudo cambiar el estado.'
          ),
      });
  }

  openQr(table: Table) {
    const url = `https://palex-4a139.web.app/r/${this.restaurant?.slug}/menu/${table.tableId}`;
    this.dialog.open(TableQrDialogComponent, {
      data: { table, url, logoUrl: 'assets/img/logo-palex.png' },
    });
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
