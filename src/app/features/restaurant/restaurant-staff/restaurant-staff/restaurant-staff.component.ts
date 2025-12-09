// restaurant-staff.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { Subject, from, filter, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
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
import { RestaurantStaffService } from '../services/restaurant-staff.service';
import { User } from '../../../../users/model/user.model';
import { ThemeService } from '../../../../core/services/theme/theme.service';

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
  isDarkMode: boolean;

  private destroy$ = new Subject<void>();

  private userService = inject(UserService);
  private dialogService = inject(DialogService);
  private dialog = inject(MatDialog);
  private restaurantStaffService = inject(RestaurantStaffService);
  private invitationService = inject(InvitationService);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);

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

  constructor() {
    this.isDarkMode = this.themeService.getDarkMode();
  }

  ngOnInit() {
    this.columns.find((c) => c.id === 'roles')!.template = this.rolesTemplate;

    this.restaurantId = this.route.parent?.snapshot.paramMap.get('restaurantId') ?? '';

    if (this.restaurantId) {
      this.loadStaff();
    }

    this.subscribeTheme();
  }

  private subscribeTheme() {
    this.themeService.darkModeObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.isDarkMode = value);
  }

  loadStaff() {
    if (!this.restaurantId) return;

    this.restaurantStaffService
      .getRestaurantEmployeesByRestaurantId(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.staff = users.map(u => ({
          ...u,
          fullname: `${u.name} ${u.lastname}`,
          rolesList: [
            // Global roles
            ...Object.keys(u.globalRoles || {}).filter(
              r => (u.globalRoles as Record<string, boolean>)[r] && this.internalRoles.includes(r)
            ),
            // Local roles for current restaurant
            ...Object.keys(u.localRoles?.[this.restaurantId] || {}).filter(
              r => (u.localRoles![this.restaurantId] as Record<string, boolean>)[r] && this.internalRoles.includes(r)
            ),
          ],
        }));
      });
  }

  changeRole(user: User) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { user, modo: 'editar-usuario', restaurantId: this.restaurantId },
    });

    dialogRef.afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        filter(result => !!result && !!user.uid),
        switchMap(result => from(this.userService.updateUser(user.uid!, { localRoles: result.localRoles })))
      )
      .subscribe(() => {
        this.dialogService.infoDialog('OK', 'Roles actualizados correctamente.');
        this.loadStaff();
      });
  }

  openInvitationDialog() {
    const dialogRef = this.dialog.open(InvitationDialogComponent, {
      width: '450px',
      data: { restaurantId: this.restaurantId },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (result) => {
        if (!result) return;

        try {
          if (result.method === 'email') {
            await this.invitationService.createInvitation(this.restaurantId, result.email, result.role);
          } else if (result.method === 'link') {
            await this.invitationService.createJoinLink(this.restaurantId, result.role);
          }
        } catch (err: any) {
          this.dialogService.errorDialog('Error', err?.message || 'No se pudo generar la invitación.');
        }
      });
  }

  deleteStaffMember(user: User) {
    this.dialogService.confirmDialog({
      title: 'Eliminar empleado del restaurante',
      message: '¿Deseas eliminar a este usuario del restaurante? No se eliminará su cuenta global.',
      type: 'question',
    })
    .pipe(
      takeUntil(this.destroy$),
      filter(ok => ok && !!user.uid),
      switchMap(() => from(this.restaurantStaffService.removeUserFromRestaurant(user.uid!, this.restaurantId)))
    )
    .subscribe(() => {
      this.dialogService.infoDialog('OK', 'Empleado eliminado del restaurante.');
      this.loadStaff();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
