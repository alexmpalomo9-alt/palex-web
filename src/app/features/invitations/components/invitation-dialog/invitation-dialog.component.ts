import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InvitationService } from '../../services/invitation.service';
import { SharedModule } from '../../../../shared/shared.module';
import { MatFormField } from '@angular/material/input';

@Component({
  selector: 'app-invitation-dialog',
  imports: [SharedModule, MatFormField],
  templateUrl: './invitation-dialog.component.html',
  styleUrl: './invitation-dialog.component.scss',
})
export class InvitationDialogComponent {
  generatedLink: string | null = null;

  form: FormGroup; // Iniciamos el formulario

  constructor(
    private dialogRef: MatDialogRef<InvitationDialogComponent>,
    private fb: FormBuilder,
    private invitationService: InvitationService,
    @Inject(MAT_DIALOG_DATA) public data: { restaurantId: string }
  ) {
    // Inicializamos el formulario con validaciones
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Validación de email
      role: ['', Validators.required], // Validación de rol
    });
  }

  // Función para generar el enlace de invitación
  async generate() {
    if (this.form.invalid) return; // Prevenir ejecución si el formulario no es válido

    const email = this.form.get('email')?.value ?? null;
    const role = this.form.get('role')?.value ?? '';

    try {
      // Llamamos al servicio para generar la invitación
      const token = await this.invitationService.createInvitation(
        this.data.restaurantId, // Aquí se pasa restaurantId
        email,
        role
      );

      // Generamos el enlace
      this.generatedLink = `${window.location.origin}/invite/${token}`;
    } catch (error) {
      console.error('Error al generar invitación', error);
    }
  }
  closeDialog() {
    this.dialogRef.close();
  }
}
