import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { regexMail } from '../../../shared/pattern/patterns';
import { validatePassword } from '../../helper/passwordValidator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth-service/auth.service';
import { DialogService } from '../../../core/services/dialog-service/dialog.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { ErrorHandlerService } from '../../../shared/services/error-firebase/error-handler.service';
import { AddButtonComponent } from '../../../shared/components/button/add-button/add-button.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [SharedModule, AddButtonComponent],
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.css'],
})
export class RegisterDialogComponent {
  userForm: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<RegisterDialogComponent>,
    private authService: AuthService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private errorHandler: ErrorHandlerService
  ) {
    this.userForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(regexMail),
        Validators.maxLength(30),
      ]),
      password: new FormControl('', [Validators.required, validatePassword]),
    });
  }

  get isFormValid(): boolean {
    return this.userForm.valid;
  }

  passwordHasError(errorCode: string): boolean {
    const control = this.userForm.get('password');
    return control?.hasError(errorCode) ?? false;
  }

  async registerUser() {
    if (!this.isFormValid) {
      this.dialogService.infoDialog(
        'Error',
        'Por favor, complete todos los campos correctamente.'
      );
      return;
    }

    try {
      this.loading = true;

      // Intentar registrar al usuario
      await this.authService.registerUser(this.userForm.value);

      // Mostrar mensaje de éxito
      this.snackBar.open('Cuenta creada correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });

      // Cerrar el diálogo
      this.dialogRef.close();

      // Mantener al usuario en la misma página donde estaba antes
      const currentUrl = this.router.url; // Guardamos la URL actual
      this.router.navigateByUrl(currentUrl); // Redirigimos al usuario a la misma URL
    } catch (error: any) {
      let message = 'No se pudo crear la cuenta. Intente nuevamente.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo ya está registrado. Por favor use otro.';
      }

      // Mostrar mensaje de error
      this.dialogService.infoDialog('Error', message);
      this.errorHandler.log(error);
    } finally {
      this.loading = false;
    }
  }

  closeDialog() {
    this.dialogRef.close();
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
