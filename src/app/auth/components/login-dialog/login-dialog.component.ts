import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';
import { AuthService } from '../../services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { UserCredentials } from '../../../users/model/user.model';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css'],
})
export class LoginDialogComponent {
  loginUser: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private authService: AuthService,
    private router: Router,
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
      this.dialogService.infoDialog(
        'Error',
        'Por favor, complete todos los campos correctamente.'
      );
      return;
    }
    this.loading = true;

    try {
      await this.authService.login(this.loginUser.value); // o registerUser
      this.dialogService.infoDialog('Éxito', 'Operación exitosa');
      this.dialogRef.close();
      this.router.navigate(['/']);
    } catch (error: any) {
      // Mensajes específicos según error
      let message =
        'No se pudo iniciar sesión. Intente de nuevo o contacte al administrador.';
      if (error.code === 'auth/user-not-found') {
        message = 'Usuario no encontrado. Verifique su correo.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta. Intente nuevamente.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos fallidos. Intente más tarde.';
      }
      this.dialogService.infoDialog('Error de credenciales', message);
      console.error(error);
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
        } else {
          this.router.navigate(['/']);
        }
        this.dialogRef.close();
      })
      .catch((error: any) => {
        let message =
          'No se pudo iniciar sesión con Google. Intente nuevamente.';
        this.dialogService.infoDialog('Error', message);
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
