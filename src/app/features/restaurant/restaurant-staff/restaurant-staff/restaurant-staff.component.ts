// restaurant-staff.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../users/model/user.model';
import { RestaurantStaffService } from '../../services/restaurant-staff.service';
import { SharedModule } from '../../../../shared/shared.module';
import {
  BaseTableComponent,
  BaseColumn,
} from '../../../../shared/components/base-table/base-table.component';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../../../users/services/user.service';
import { UserDialogComponent } from '../../../../users/components/user-dialog/user-dialog.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { InvitationService } from '../../../invitations/services/invitation.service';
import { InvitationDialogComponent } from '../../../invitations/components/invitation-dialog/invitation-dialog.component';
import { RolePermissionsInfoComponent } from '../role-permissions-info/role-permissions-info.component';

@Component({
  selector: 'app-restaurant-staff',
  standalone: true,
  imports: [
    SharedModule,
    BaseTableComponent,
    MatChipsModule,
    RolePermissionsInfoComponent,
  ],
  templateUrl: './restaurant-staff.component.html',
  styleUrls: ['./restaurant-staff.component.scss'],
})
export class RestaurantStaffComponent implements OnInit, OnDestroy {
  restaurantId!: string;
  staff: User[] = [];
  showDisabled = false;

  private destroy$ = new Subject<void>();
  private userService = inject(UserService);
  private dialogService = inject(DialogService);
  private dialog = inject(MatDialog);
  private restaurantStaffService = inject(RestaurantStaffService);
  private invitationService = inject(InvitationService);

  private internalRoles = [
    'adminGlobal',
    'adminLocal',
    'mozo',
    'cocina',
    'manager',
  ];

  @ViewChild('rolesTemplate', { static: true })
  rolesTemplate!: TemplateRef<any>;

  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate!: TemplateRef<any>;

  columns: BaseColumn[] = [
    { id: 'fullname', label: 'Nombre' },
    { id: 'email', label: 'Email' },
    { id: 'roles', label: 'Roles' },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.columns.find((c) => c.id === 'roles')!.template = this.rolesTemplate;

    // 🔥 USAMOS DIRECTAMENTE EL ID REAL DEL RESTAURANTE DESDE LA RUTA
    this.restaurantId =
      this.route.parent?.snapshot.paramMap.get('restaurantId') ?? '';

    if (this.restaurantId) {
      this.loadStaff();
    }
  }

  loadStaff() {
    if (!this.restaurantId) return;

    this.restaurantStaffService
      .getRestaurantEmployeesByRestaurantId(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.staff = users.map((u) => ({
          ...u,
          fullname: `${u.name} ${u.lastname}`,

          rolesList: [
            // GLOBAL ROLES
            ...Object.keys(u.globalRoles || {}).filter(
              (r) =>
                (u.globalRoles as Record<string, boolean>)[r] &&
                this.internalRoles.includes(r)
            ),

            // LOCAL ROLES DEL RESTAURANTE ACTUAL
            ...Object.keys(u.localRoles?.[this.restaurantId] || {}).filter(
              (r) =>
                (u.localRoles![this.restaurantId] as Record<string, boolean>)[
                  r
                ] && this.internalRoles.includes(r)
            ),
          ],
        }));
      });
  }

  async changeRole(user: User) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { user, modo: 'editar-usuario', restaurantId: this.restaurantId },
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (!result || !user.uid) return;

    // 🔥 NO envies globalRoles (para evitar undefined)
    await this.userService.updateUser(user.uid, {
      localRoles: result.localRoles,
    });

    this.dialogService.infoDialog('OK', 'Roles actualizados correctamente.');
    this.loadStaff();
  }

  async openInvitationDialog() {
    const dialogRef = this.dialog.open(InvitationDialogComponent, {
      width: '450px',
      data: { restaurantId: this.restaurantId },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;

      try {
        if (result.method === 'email') {
          await this.invitationService.createInvitation(
            this.restaurantId,
            result.email,
            result.role
          );
        }

        if (result.method === 'link') {
          await this.invitationService.createJoinLink(
            this.restaurantId,
            result.role
          );
        }
      } catch (err: any) {
        this.dialogService.errorDialog(
          'Error',
          err?.message || 'No se pudo generar la invitación.'
        );
      }
    });
  }

  async deleteStaffMember(user: User) {
    this.dialogService
      .confirmDialog({
        title: 'Eliminar empleado del restaurante',
        message:
          '¿Deseas eliminar a este usuario del restaurante? No se eliminará su cuenta global.',
        type: 'question',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (ok) => {
        if (!ok || !user.uid) return;

        await this.restaurantStaffService.removeUserFromRestaurant(
          user.uid,
          this.restaurantId
        );

        this.dialogService.infoDialog(
          'OK',
          'Empleado eliminado del restaurante.'
        );
        this.loadStaff();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
