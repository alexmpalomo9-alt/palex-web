import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { OrdersService } from '../../../order/services/order.service';
import { Table } from '../model/tables.model';
import { TableService } from '../services/table.service';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { ActivatedRoute } from '@angular/router';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { TableDialogService } from '../services/table-dialog/table-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-restaurant-tables',
  templateUrl: './restaurant-tables.component.html',
  styleUrls: ['./restaurant-tables.component.scss'],
  imports: [SharedModule],
})
export class RestaurantTablesComponent implements OnInit, OnDestroy {
  restaurantId!: string; // viene del auth o del contexto
  @Input() restaurant: Restaurant | null = null;

  tables: Table[] = [];
  loading = true;

  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private restaurantService: RestaurantService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private tableDialogService: TableDialogService
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

      this.loadTables(); // ✔️ recién ahora es seguro llamar
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

  
  // --------------------------------------------------
  // ACCIONES
  // --------------------------------------------------

  openCreateTable() {
    if (!this.restaurant) return;
    this.tableDialogService
      .openTableDialog({ mode: 'create' })
      .subscribe(async (result) => {
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelar',
            'No se realizaron cambios.'
          );
          return;
        }

        try {
          await this.tableService.createTable({
            ...result,
            restaurantId: this.restaurant!.restaurantId,
          });

          this.dialogService.infoDialog('Éxito', 'Mesa creada correctamente.');
          this.loadTables();
        } catch (e: any) {
          this.dialogService.errorDialog(
            'Error',
            e.message || 'Ocurrió un error inesperado.'
          );
        }
      });
  }

  openEditTable(table: Table) {
    if (!this.restaurant) return;

    const restaurant = this.restaurant; // ← tipo Restaurant GARANTIZADO

    this.tableDialogService
      .openTableDialog({ mode: 'edit', data: table })
      .subscribe(async (result) => {
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelado',
            'No se realizó la acción.'
          );
          return;
        }

        const { restaurantId } = restaurant;
        const { restaurantId: _ignore, ...cleanData } = result;

        try {
          // Intentar actualizar (la validación en TableService puede lanzar)
          await this.tableService.updateTable(
            restaurantId,
            table.tableId!,
            cleanData
          );

          // Si llegamos acá, todo salió bien
          this.dialogService.infoDialog(
            'Éxito',
            'Mesa actualizada correctamente.'
          );
          this.loadTables();
        } catch (error: any) {
          // Mostrar dialog con el mensaje del error (si existe)
          this.dialogService.errorDialog(
            'Error',
            error?.message ||
              'Ocurrió un error inesperado al actualizar la mesa.'
          );
          // opcional: volver a abrir el diálogo para corregir (no obligatorio)
        }
      });
  }

  deleteTable(table: Table) {
    if (!table.tableId || !this.restaurant) return;

    this.dialogService
      .confirmDialog({
        title: '¿Eliminar Permanente?',
        message:
          '¿Estás seguro de que deseas eliminar la mesa de forma permanente? Esta acción no se puede deshacer.',
        type: 'confirm',
      })
      .subscribe(async (result) => {
        if (!result) {
          this.dialogService.infoDialog(
            'Cancelado',
            'No se realizó la acción.'
          );
          return;
        }

        try {
          await this.tableService.deleteTable(
            this.restaurant!.restaurantId,
            table.tableId
          );
          this.dialogService.infoDialog(
            'Éxito',
            'La mesa ha sido eliminado correctamente.'
          );

          this.loadTables();
        } catch (error: any) {
          this.dialogService.errorDialog(
            'Error',
            error.message || 'Ocurrió un error inesperado.'
          );
        }
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

  viewOrder(orderId: string | null) {
    if (!orderId) return;
    console.log('Ver pedido', orderId);
    // abrir diálogo o navegar al pedido
  }
}
