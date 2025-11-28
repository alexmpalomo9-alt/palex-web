import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { User, UserDialogData, UserDialogMode } from '../../model/user.model';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { CustomDateAdapter } from '../../../shared/services/date/CustomDateAdapter';
import {
  regexTextos,
  regexMail,
  regexDireccion,
  regexNumeros,
} from '../../../shared/pattern/patterns';
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

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.modo = data.modo;
    const user = data.user;

    this.editForm = new FormGroup({
      name: new FormControl(user.name ?? ''),
      lastname: new FormControl(user.lastname ?? ''),
      email: new FormControl({ value: user.email, disabled: true }),
      phone: new FormControl(user.phone ?? ''),
      address: new FormControl(user.address ?? ''),
      birthdate: new FormControl(
        user.birthdate ? new Date(user.birthdate) : null
      ),

      adminGlobal: new FormControl(user.roles?.adminGlobal ?? false),
      adminLocal: new FormControl(user.roles?.adminLocal ?? false),
      mozo: new FormControl(user.roles?.mozo ?? false),
      cocina: new FormControl(user.roles?.cocina ?? false),
      gerencia: new FormControl(user.roles?.gerencia ?? false),
      customer: new FormControl(user.roles?.customer ?? false),
      guest: new FormControl(user.roles?.guest ?? false),
    });
  }

  aceptar() {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const f = this.editForm.getRawValue();

    const partialUpdate: Partial<User> = {
      name: f.name,
      lastname: f.lastname,
      birthdate: f.birthdate,
      address: f.address,
      phone: f.phone,
      roles: {
        adminGlobal: f.adminGlobal,
        adminLocal: f.adminLocal,
        mozo: f.mozo,
        cocina: f.cocina,
        gerencia: f.gerencia,
        customer: f.customer,
        guest: f.guest,
      },
    };

    this.dialogRef.close(partialUpdate);
  }
  cancelar() {
    this.dialogRef.close();
  }
}
