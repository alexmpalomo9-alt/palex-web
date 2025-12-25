import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type FeedbackType = 'success' | 'info' | 'error';

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  constructor(private snackbar: MatSnackBar) {}

  show(message: string, type: FeedbackType = 'info') {
    const config = {
      success: {
        duration: 3000,
        panelClass: 'snackbar-success',
      },
      info: {
        duration: 2500,
        panelClass: 'snackbar-info',
      },
      error: {
        duration: 4000,
        panelClass: 'snackbar-error',
      },
    };

    this.snackbar.open(message, 'OK', config[type]);
  }
}