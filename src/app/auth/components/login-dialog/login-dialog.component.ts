import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DialogService } from '../../../core/services/dialog-service/dialog.service';
import { ErrorHandlerService } from '../../../shared/services/error-firebase/error-handler.service';
import { SharedModule } from '../../../shared/shared.module';
import { UserCredentials } from '../../../users/model/user.model';
import { AuthService } from '../../services/auth-service/auth.service';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';
import { AddButtonComponent } from '../../../shared/components/button/add-button/add-button.component';

@Component({
  selector: 'app-login-dialog',
  imports: [SharedModule, AddButtonComponent],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent {
  loginUser: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private errorHandler: ErrorHandlerService,
    @Inject(MAT_DIALOG_DATA) public data: UserCredentials
  ) {
    this.loginUser = new FormGroup({
      email: new FormControl(data.email, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(data.password, [Validators.required]),
    });
  }

  get isFormValid(): boolean {
    return this.loginUser.valid;
  }

  async login() {
    if (!this.isFormValid) {
      this.snackBar.open(
        'Por favor, complete todos los campos correctamente.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
      return;
    }
    this.loading = true;

    try {
      await this.authService.login(this.loginUser.value);
      this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      this.dialogRef.close();
    } catch (error: any) {
      const message = this.errorHandler.handleFirebaseError(error);
      this.snackBar.open(message, 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      this.errorHandler.log(error);
    } finally {
      this.loading = false;
    }
  }

  loginGoogle() {
    this.authService
      .loginWithGoogle()
      .then((response) => {
        if ('newUser' in response && (response as any).newUser) {
          this.router.navigate(['/form']);
          this.snackBar.open(
            'Bienvenido, nuevo usuario. Completa tu perfil.',
            'Cerrar',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
        } else {
          this.router.navigate(['/']);
          this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        }
        this.dialogRef.close();
      })
      .catch((error: any) => {
        const message = this.errorHandler.handleFirebaseError(error);
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        console.error(error);
      });
  }

  registerDialog() {
    this.dialogRef.close();
    this.dialog.open(RegisterDialogComponent, {
      data: { email: '', password: '' },
      disableClose: true,
    });
  }

  openResetDialog() {
    this.dialogRef.close();
    this.dialog.open(ResetPasswordDialogComponent, { disableClose: true });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
