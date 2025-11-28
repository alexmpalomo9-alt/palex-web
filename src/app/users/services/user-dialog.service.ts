import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserDialogComponent } from '../components/user-dialog/user-dialog.component';
import { User } from '../model/user.model';

type DialogMode = 'create' | 'edit';

@Injectable({
  providedIn: 'root',
})
export class UserDialogService {
  constructor(private dialog: MatDialog) {}

  openUserDialog(options: { mode: DialogMode; data?: User }): Observable<any> {
    const emptyUser: User = {
      uid: '',
      email: '',
      name: '',
      lastname: '',
      birthdate: null,
      address: '',
      phone: '',
      photoURL: '',
      roles: {
        adminGlobal: false,
        adminLocal: false,
        mozo: false,
        cocina: false,
        gerencia: false,
        customer: false,
        guest: false,
      },
      restaurantsOwner: [],
      restaurantsStaff: [],
      enabled: true,
      createdAt: null,
    };

    const dialogRef = this.dialog.open(UserDialogComponent, {
      disableClose: true,
      data: {
        modo: options.mode === 'edit' ? 'editar-usuario' : 'editar-perfil',
        user: options.data ?? emptyUser,
      },
    });

    return dialogRef.afterClosed();
  }
}
