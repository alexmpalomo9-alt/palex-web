import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}
  /**
   * Abre un diálogo de confirmación genérico (aceptar/cancelar).
   * Retorna un observable con el resultado booleano.
   */
  confirmDialog(options: {
    title: string;
    message: string;
    type?: 'confirm' | 'info' | 'error' | 'question' | 'enable';
  }) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      width: '600px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,

      data: {
        title: options.title,
        message: options.message,
        type: options.type || 'confirm',
      },
    });

    return dialogRef.afterClosed(); // observable<boolean>
  }

  /* Muestra un mensaje informativo (sin opciones). */
  infoDialog(title: string, message: string) {
    return this.confirmDialog({ title, message, type: 'info' });
  }

  /* Muestra un mensaje de error (dos opciones). */
  errorDialog(title: string, message: string) {
    return this.confirmDialog({ title, message, type: 'error' });
  }

  /* Muestra un mensaje de pregunta (dos opciones).*/
  questionDialog(title: string, message: string) {
    return this.confirmDialog({ title, message, type: 'question' });
  }
  promptDialog(config: { title?: string; message?: string }): Promise<string | null> {
  return new Promise(resolve => {
    const result = prompt(`${config.title ?? ''}\n${config.message ?? ''}`);
    resolve(result && result.trim() !== '' ? result : null);
  });
}

}
