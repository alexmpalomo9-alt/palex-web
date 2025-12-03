import { Component, inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableService } from '../services/table.service';
import { Table } from '../model/tables.model';
import { SharedModule } from '../../../../shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { TableDialogService } from '../services/table-dialog/table-dialog.service';
import { TableQrDialogComponent } from '../../../../shared/components/qr-preview/table-qr-dialog/table-qr-dialog.component';

@Component({
  selector: 'app-restaurant-tables',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './restaurant-tables.component.html',
  styleUrls: ['./restaurant-tables.component.scss'],
})
export class RestaurantTablesComponent implements OnInit {
  @Input() restaurant: Restaurant | null = null;

  private tableService = inject(TableService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);
  private dialogService = inject(DialogService);
  private tableDialogService = inject(TableDialogService);

  restaurantId!: string;
  tables: Table[] = [];
  loading = false;

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      const slug = params.get('restaurantId');
      if (!slug) return;

    this.restaurantService.getRestaurantBySlug(slug).subscribe((restaurant) => {
      if (!restaurant) return;

      this.restaurant = restaurant;
      this.restaurantId = restaurant.restaurantId!;
      this.loadTables();
    });
    });
  }
  openQr(table: any) {
    const url = `https://palex-4a139.web.app/r/${this.restaurant?.slug}/menu/${table.tableId}`;

    this.dialog.open(TableQrDialogComponent, {
      data: {
        table,
        url,
        logoUrl: 'assets/img/logo-palex.png',
      },
    });
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
        this.dialogService.infoDialog('Éxito', 'Mesa actualizada correctamente.');
        this.loadTables();
      } catch (error: any) {
        // Mostrar dialog con el mensaje del error (si existe)
        this.dialogService.errorDialog(
          'Error',
          error?.message || 'Ocurrió un error inesperado al actualizar la mesa.'
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

  /** Cambiar estado */
  async changeStatus(
    table: Table,
    newStatus: 'available' | 'occupied' | 'reserved'
  ) {
    await this.tableService.updateTable(this.restaurantId, table.tableId, {
      status: newStatus,
    });
  }
}
