import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  constructor(private snackbar: MatSnackBar) {}

  success(message: string) {
    this.snackbar.open(message, 'OK', {
      duration: 3000,
      panelClass: 'snackbar-success',
    });
  }

  info(message: string) {
    this.snackbar.open(message, 'OK', {
      duration: 2500,
      panelClass: 'snackbar-info',
    });
  }
}
