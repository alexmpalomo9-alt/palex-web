import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Table } from '../../model/tables.model';
import { TableDialogComponent } from '../../table-dialog/table-dialog.component';


@Injectable({
  providedIn: 'root',
})
export class TableDialogService {
  constructor(private dialog: MatDialog) {}

  openTableDialog(options: { mode: 'create' | 'edit'; data?: Table }): Observable<Table> {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      disableClose: true,
      width: '600px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
      data: {
        mode: options.mode,
        table:
          options.mode === 'edit'
            ? { ...options.data } // ← Pasamos la mesa completa
            : {
                tableId: '',
                restaurantId: '',
                number: '',
                name: '',
                status: 'available',
                currentOrderId: '',
                qrCode: '',
                qrSlug: '',
                sector: '',
                capacity: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
      },
    });

    return dialogRef.afterClosed();
  }
}
