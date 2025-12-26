import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Subject,
  from,
  filter,
  switchMap,
  takeUntil,
  tap,
  firstValueFrom,
} from 'rxjs';
import { Table } from '../model/tables.model';
import { TableService } from '../services/table.service';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { ActivatedRoute } from '@angular/router';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';
import { TableDialogService } from '../services/table-dialog/table-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { OrderDialogComponent } from '../../restaurant-orders/order-dialog/order-dialog.component';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { SectionHeaderComponent } from '../../shared/section-header/section-header/section-header.component';
import { DialogService } from '../../../../core/services/dialog-service/dialog.service';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { UiFeedbackService } from '../../../../shared/services/ui-feedback/ui-feedback.service';
import { TableUtilsService } from '../services/table-utils/table-utils.service';
import { OrderUtilsService } from '../services/order-utils/order-utils.service';
import { SelectTablesDialogComponent } from '../../../order/components/select-tables-dialog/select-tables-dialog.component';
import { ORDER_STATUS_CONFIG } from '../../../order/status/model/order.status.model';
import { OrderStatusService } from '../../../order/status/order-status/order-status.service';
import { Order } from '../../../order/models/order.model';
import { OrderService } from '../../../order/services/order-service/order.service';
import { TableStatusService } from '../services/table-status/table-status.service';

@Component({
  selector: 'app-restaurant-tables',
  templateUrl: './restaurant-tables.component.html',
  styleUrls: ['./restaurant-tables.component.scss'],
  standalone: true,
  imports: [SharedModule, SectionHeaderComponent, AddButtonComponent],
})
export class RestaurantTablesComponent implements OnInit, OnDestroy {
  @Input() restaurant: Restaurant | null = null;
  restaurantId!: string;

  tables: Table[] = [];
  filteredTables: Table[] = [];
  loading = true;
  isDarkMode: boolean;
  ordersMap: Map<string, Order> = new Map();

  private destroy$ = new Subject<void>();
  private tableService = inject(TableService);
  private restaurantService = inject(RestaurantService);
  private dialogService = inject(DialogService);
  private tableDialogService = inject(TableDialogService);
  private themeService = inject(ThemeService);
  private route = inject(ActivatedRoute);
  private tableUtilsService = inject(TableUtilsService);
  private orderUtilsService = inject(OrderUtilsService);
  private dialog = inject(MatDialog);
  private orderService = inject(OrderService);
  private tableStatusService = inject(TableStatusService)

  constructor() {
    this.isDarkMode = this.themeService.getDarkMode();
  }

  displayedColumns: string[] = [
    'number',
    'name',
    'capacity',
    'status',
    'sector',
    'actions',
  ];

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('restaurantId');
    if (!slug) return;

    // Cargar restaurante y luego mesas
    this.restaurantService
      .getRestaurantBySlug(slug)
      .pipe(
        takeUntil(this.destroy$),
        filter((r) => !!r),
        tap((r) => {
          this.restaurant = r!;
          this.restaurantId = r!.restaurantId;
        }),
        switchMap(() => this.loadTablesObservable()) // Cargar mesas después de tener el restaurante
      )
      .subscribe(() => {
        this.loadActiveOrders(); // Cargar las órdenes activas
      });

    // Suscripción al tema oscuro
    this.subscribeTheme();
  }

  // Método para obtener la orden de la mesa
  getOrderForTable(table: Table): Order | null {
    return this.tableUtilsService.getOrderForTable(table, this.ordersMap);
  }
  //  obtener el estado de la mesa
  getTableStatusLabel(table: Table): string {
    return this.tableStatusService.getTableStatusLabel(table);
  }

  //  obtener el color de la mesa
  getTableStatusColor(table: Table): string {
    return this.tableStatusService.getTableStatusColor(table);
  }

  // Cargar órdenes activas
  async loadActiveOrders() {
    if (!this.restaurantId) return;
    try {
      const orders = await this.orderService.getActiveOrdersByRestaurant(
        this.restaurantId
      );
      this.ordersMap.clear();
      orders.forEach((order) => {
        if (order.orderId) {
          this.ordersMap.set(order.orderId, order);
        }
      });
    } catch (error) {
      console.error('Error cargando las órdenes activas', error);
    }
  }

// Obtener color del estado del pedido
getOrderStatusColor(table: Table): string {
  if (!table.currentOrderId) return ''; // Si no hay pedido, no mostramos color
  const order = this.ordersMap.get(table.currentOrderId!); // Buscar la orden activa
  return order ? ORDER_STATUS_CONFIG[order.status]?.color : '';  // Usar la configuración del estado de la orden
}

// Obtener etiqueta del estado del pedido
getOrderStatusLabel(table: Table): string {
  if (!table.currentOrderId) return ''; // Si no hay pedido, no mostramos etiqueta
  const order = this.ordersMap.get(table.currentOrderId!); // Buscar la orden activa
  return order ? ORDER_STATUS_CONFIG[order.status]?.label : '';  // Usar la etiqueta del estado de la orden
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
        this.filteredTables = tables;
        this.loading = false;
      })
    );
  }

  loadTables() {
    this.loadTablesObservable().subscribe();
  }

  // =======================
  // Usar el servicio para la búsqueda
  onSearch(searchTerm: string) {
    this.filteredTables = this.tableUtilsService.onSearch(
      this.tables,
      searchTerm
    );
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
        next: () => {
          this.dialogService.infoDialog('Éxito', 'Mesa creada correctamente.');
          this.loadTables();
        },
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
        next: () => {
          this.dialogService.infoDialog(
            'Éxito',
            'Mesa actualizada correctamente.'
          );
          this.loadTables();
        },
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
        next: () => {
          this.dialogService.infoDialog(
            'Éxito',
            'La mesa ha sido eliminada correctamente.'
          );
          this.loadTables();
        },
        error: (e) =>
          this.dialogService.errorDialog(
            'Error',
            e?.message || 'Ocurrió un error inesperado.'
          ),
      });
  }

  // =======================
  // ESTADO MESA
  // =======================
  changeStatus(table: Table, status: Table['status']) {
    if (!this.restaurant) return;
    this.tableUtilsService.changeStatus(
      this.restaurant.restaurantId,
      table,
      status
    );
  }

  // =======================
  // QR
  // =======================
  openQr(table: Table) {
    if (!this.restaurant) return;
    this.tableUtilsService.openQr(table, this.restaurant.slug);
  }

  viewOrder(orderId: string | null, table: Table) {
    if (!this.restaurant) return;
    this.orderUtilsService.viewOrder(
      this.restaurant.restaurantId,
      orderId,
      table,
      this.selectTablesForNewOrder.bind(this) // Ahora la función está definida en el componente
    );
  }
  // Función para seleccionar mesas al crear un pedido
  async selectTablesForNewOrder(baseTable: Table): Promise<Table[]> {
    const dialogRef = this.dialog.open(SelectTablesDialogComponent, {
      width: '400px',
      data: { tables: this.tables, baseTable },
    });

    return (await firstValueFrom(dialogRef.afterClosed())) ?? [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
