import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  User,
  UserDialogData,
  UserDialogMode,
} from '../../model/user.model';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { CustomDateAdapter } from '../../../shared/services/date/CustomDateAdapter';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [SharedModule],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css'],
})
export class UserDialogComponent {
  editForm: FormGroup;
  modo!: UserDialogMode;

  // 🔥 ESTE RESTAURANTE ES EL QUE EDITAMOS ROLES
  restaurantId!: string;

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData & { restaurantId?: string }
  ) {
    this.modo = data.modo;
    const user = data.user;

    // 🔥 El componente staff debe enviar restaurantId
    this.restaurantId = (data as any).restaurantId;

    // Inicializamos roles locales para este restaurante
    const local = user.localRoles?.[this.restaurantId] || {};

this.editForm = new FormGroup({
  name: new FormControl({ value: user.name ?? '', disabled: true }),
  lastname: new FormControl({ value: user.lastname ?? '', disabled: true }),
  email: new FormControl({ value: user.email ?? '', disabled: true }),
  phone: new FormControl({ value: user.phone ?? '', disabled: true }),
  address: new FormControl({ value: user.address ?? '', disabled: true }),
  birthdate: new FormControl({
    value: user.birthdate ? new Date(user.birthdate) : null,
    disabled: true,
  }),

  // Solo estos cuatro son editables
  adminLocal: new FormControl(local.adminLocal ?? false),
  mozo: new FormControl(local.mozo ?? false),
  cocina: new FormControl(local.cocina ?? false),
  manager: new FormControl(local.manager ?? false),
});
  }

aceptar() {
  const f = this.editForm.getRawValue();
  const user = this.data.user;

  const newLocalRoles = {
    ...(user.localRoles ?? {}),
    [this.restaurantId]: {
      adminLocal: f.adminLocal,
      mozo: f.mozo,
      cocina: f.cocina,
      manager: f.manager,
    }
  };

  const partialUpdate: Partial<User> = {
    localRoles: newLocalRoles
  };

  this.dialogRef.close(partialUpdate);
}

  cancelar() {
    this.dialogRef.close();
  }
}
