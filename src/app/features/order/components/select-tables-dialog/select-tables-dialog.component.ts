import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Table } from '../../../restaurant/restaurant-tables/model/tables.model';
import { SharedModule } from '../../../../shared/shared.module';


@Component({
  selector: 'app-select-tables-dialog',
  imports: [SharedModule],
  templateUrl: './select-tables-dialog.component.html',
  styleUrl: './select-tables-dialog.component.scss'
})
export class SelectTablesDialogComponent {
  tables: Table[] = [];
  selectedTables: Table[] = [];

constructor(
  private dialogRef: MatDialogRef<SelectTablesDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { tables: Table[], baseTable?: Table | null }
) {
this.tables = data.tables.filter(
  t =>
    (t.status === 'available' || t.status === 'seated') &&
    !t.currentOrderId
);
  this.selectedTables = data.baseTable ? [data.baseTable] : [];
}

  confirm() {
    this.dialogRef.close(this.selectedTables);
  }

  close() {
    this.dialogRef.close(null);
  }
}
