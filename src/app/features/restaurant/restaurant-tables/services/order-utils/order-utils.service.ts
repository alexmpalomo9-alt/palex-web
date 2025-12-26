import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialogComponent } from '../../../restaurant-orders/order-dialog/order-dialog.component';
import { Table } from '../../model/tables.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class OrderUtilsService {
  constructor(
    private dialog: MatDialog,
        private snackBar: MatSnackBar,

  ) {}

  // Lógica para ver un pedido
  async viewOrder(
    restaurantId: string,
    orderId: string | null,
    table: Table,
    selectTablesForNewOrder: (baseTable: Table) => Promise<Table[]>
  ) {
    // Si no se pasa un orderId, se toma el orderId actual de la mesa
    if (table.currentOrderId) orderId = table.currentOrderId;

    // Si no hay un orderId, solo permitir si la mesa está disponible o ocupada
    if (!orderId) {
      const canCreate = table.status === 'available' || table.status === 'seated';
      if (!canCreate) {
        alert(`Mesa ${table.number} no disponible`);
        return;
      }
    }

    // Seleccionar las mesas para el pedido
    let selectedTables: Table[] = [];
    if (orderId) {
      selectedTables = [table];
    } else {
      selectedTables = await selectTablesForNewOrder(table);
      if (!selectedTables.length) return; // Si no se seleccionan mesas, no continuar
    }

    // Abrir el dialogo de pedidos
    const dialogRef = this.dialog.open(OrderDialogComponent, {
      disableClose: true,
      data: {
        restaurantId,
        orderId,
        tableIds: selectedTables.map((t) => t.tableId),
        tableNumbers: selectedTables.map((t) => t.number),
        isNew: !orderId,
      },
    });

    // Manejar el cierre del diálogo
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.snackBar.open('Pedido actualizado correctamente', 'OK', {
          duration: 3000,
        });
        // Aquí puedes agregar la lógica para recargar los pedidos activos si lo deseas
      }
    });
  }
}
