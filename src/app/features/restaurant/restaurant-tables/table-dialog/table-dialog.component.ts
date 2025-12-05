import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Table } from '../model/tables.model';
import { SharedModule } from '../../../../shared/shared.module';
import { regexNumeros, regexAlfanumericoConEspacios, regexTextos } from '../../../../shared/pattern/patterns';


export interface TableDialogData {
  mode: 'create' | 'edit';
  table?: Table;
  restaurantId: string;
}

@Component({
  selector: 'app-table-dialog',
  imports: [SharedModule],
  templateUrl: './table-dialog.component.html',
  styleUrl: './table-dialog.component.scss'
})
export class TableDialogComponent {
  editForm: FormGroup;
  mode!: 'create' | 'edit';

  constructor(
    private dialogRef: MatDialogRef<TableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TableDialogData
  ) {
    this.mode = data.mode;

    const t = data.table ?? {
      tableId: '',
      restaurantId: data.restaurantId,
      number: '',
      name: '',
      status: 'available',
      currentOrderId: '',
      qrCode: '',
      qrSlug: '',
      sector: '',
      capacity: 1,
      createdAt: new Date().toISOString(),
      updatedAt: '',
    };

    this.editForm = new FormGroup({
      number: new FormControl(t.number, [
        Validators.required,
        Validators.pattern(regexNumeros),
      ]),

      name: new FormControl(t.name || '', [
        Validators.pattern(regexAlfanumericoConEspacios),
      ]),

      status: new FormControl(t.status, Validators.required),

      capacity: new FormControl(t.capacity, [
        Validators.pattern(regexNumeros),
      ]),

      sector: new FormControl(t.sector || '', [
        Validators.pattern(regexAlfanumericoConEspacios),
      ]),
    });
  }

  saveTable() {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.editForm.value,
      restaurantId: this.data.restaurantId,
    };

    formData.number = Number(formData.number);
    formData.capacity = Number(formData.capacity);

    if (this.mode === 'edit') {
      formData.tableId = this.data.table?.tableId;
      formData.updatedAt = new Date().toISOString();
    } else {
      formData.createdAt = new Date().toISOString();
    }

    this.dialogRef.close(formData);
  }

  cancel() {
    this.dialogRef.close();
  }
}
