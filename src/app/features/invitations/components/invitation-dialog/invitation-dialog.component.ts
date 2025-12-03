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

  form!: FormGroup; // 👉 Declaramos la propiedad sin inicializar

  constructor(
    private fb: FormBuilder,
    private invitationService: InvitationService,
    @Inject(MAT_DIALOG_DATA) public data: { restaurantId: string }
  ) {
    // 👉 Ahora sí, inicializamos con fb ya disponible
    this.form = this.fb.group({
      email: [''],
      role: ['', Validators.required],
    });
  }

  async generate() {
    const email = this.form.get('email')?.value ?? null;
    const role = this.form.get('role')?.value ?? '';

    const token = await this.invitationService.createInvitation(
      this.data.restaurantId,
      email,
      role
    );

    this.generatedLink = `${window.location.origin}/invite/${token}`;
  }
}
