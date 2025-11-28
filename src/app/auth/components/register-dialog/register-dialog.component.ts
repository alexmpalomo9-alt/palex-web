import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { regexMail } from '../../../shared/pattern/patterns';
import { validatePassword } from '../../helper/passwordValidator';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [SharedModule],
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
    private router: Router
  ) {
    this.userForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      lastname: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.pattern(regexMail), Validators.maxLength(30)]),
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
      this.dialogService.infoDialog('Error', 'Complete todos los campos correctamente.');
      return;
    }

    try {
      await this.authService.registerUser(this.userForm.value);
      this.dialogService.infoDialog('Éxito', 'Cuenta creada correctamente.');
      this.dialogRef.close();
      this.router.navigate(['/']);
    } catch (error: any) {
      let message = 'No se pudo crear la cuenta. Intente nuevamente.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo ya está registrado. Por favor use otro.';
      }
      this.dialogService.infoDialog('Error', message);
      console.error(error);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
