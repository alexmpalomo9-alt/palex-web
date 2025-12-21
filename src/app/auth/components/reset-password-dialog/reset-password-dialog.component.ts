import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../shared/shared.module';
import { AuthService } from '../../services/auth-service/auth.service';
import { AddButtonComponent } from '../../../shared/components/button/add-button/add-button.component';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.css'],
  imports: [SharedModule, AddButtonComponent],
})
export class ResetPasswordDialogComponent {
  resetForm: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    private authService: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {
    this.resetForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  // Método para enviar el email de recuperación
  async sendReset() {
    if (this.resetForm.invalid) return;
    this.loading = true;
    const email = this.resetForm.value.email;
    try {
      // Intentamos enviar el email de recuperación
      await this.authService.sendPasswordReset(email);
      this.snack.open(
        'Email de recuperación enviado. Mirá tu casilla.',
        'Cerrar',
        { duration: 4000 }
      );
      this.dialogRef.close(true); // Cierra el diálogo y puede devolver un valor
    } catch (err: any) {
      // Manejamos cualquier error al enviar el email
      const msg = err?.message ?? 'Error al enviar email. Intentá nuevamente.';
      this.snack.open(msg, 'Cerrar', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  // Método para cerrar el diálogo
  closeDialog() {
    this.dialogRef.close(false);
  }

  backToLogin() {
    this.dialogRef.close(); // Cierra el diálogo de registro

    const dialogRef = this.dialog.open(LoginDialogComponent, {
      data: { email: '', password: '' },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Opcionalmente puedes hacer algo cuando el diálogo se cierra
    });
  }
}
