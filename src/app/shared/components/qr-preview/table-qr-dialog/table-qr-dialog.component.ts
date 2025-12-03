import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QrPreviewComponent } from '../qr-preview/qr-preview.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-qr-dialog',
  standalone: true,
  imports: [CommonModule,   MatDialogModule,
  MatButtonModule,
  MatIconModule,  // 👈 FALTA ESTA
  QrPreviewComponent
],
  templateUrl: './table-qr-dialog.component.html',
  styleUrls: ['./table-qr-dialog.component.scss'],
})
export class TableQrDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialogRef: MatDialogRef<TableQrDialogComponent>) {}

  close() {
  this.dialogRef.close();
}

}
