import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../shared/shared.module';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.css'],
  imports: [SharedModule] 
})
export class ResetPasswordDialogComponent {
  resetForm: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    private authService: AuthService,
    private snack: MatSnackBar
  ) {
    this.resetForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  async sendReset() {
    if (this.resetForm.invalid) return;
    this.loading = true;
    const email = this.resetForm.value.email;
    try {
      await this.authService.sendPasswordReset(email);
      this.snack.open('Email de recuperación enviado. Mirá tu casilla.', 'Cerrar', { duration: 4000 });
      this.dialogRef.close(true);
    } catch (err: any) {
      // handleError en service lanza Error con mensaje amigable; igual por si acaso:
      const msg = err?.message ?? 'Error al enviar email. Intentá nuevamente.';
      this.snack.open(msg, 'Cerrar', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
