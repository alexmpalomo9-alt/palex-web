import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  ViewChild,
  TemplateRef,
  inject,
} from '@angular/core';

import { Subject, takeUntil } from 'rxjs';

import { SharedModule } from '../../shared/shared.module';
import {
  BaseTableComponent,
  BaseColumn,
} from '../../shared/components/base-table/base-table.component';

import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';

import { User } from '../../users/model/user.model';
import { UserService } from '../../users/services/user.service';
import { DialogService } from '../../core/services/dialog.service';
import { UserDialogComponent } from '../../users/components/user-dialog/user-dialog.component';
import { RestaurantStaffService } from '../../features/restaurant/services/restaurant-staff.service';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [SharedModule, BaseTableComponent, MatChipsModule],
  templateUrl: './staff-management.component.html',
  styleUrl: './staff-management.component.css',
})
export class StaffManagementComponent implements OnInit, OnChanges, OnDestroy {
  // Services
  private userService = inject(UserService);
  private dialogService = inject(DialogService);
  private dialog = inject(MatDialog);
  private restaurantStaffService = inject(RestaurantStaffService);

  // Inputs
  @Input() restaurantId!: string;
  @Input() showDisabled = false;

  // Data
  staff: User[] = [];

  private destroy$ = new Subject<void>();

  @ViewChild('rolesTemplate', { static: true })
  rolesTemplate!: TemplateRef<any>;

  columns: BaseColumn[] = [
    { id: 'fullname', label: 'Nombre' },
    { id: 'email', label: 'Email' },
    { id: 'roles', label: 'Roles', template: null },
  ];

  ngOnInit() {
    this.columns.find((c) => c.id === 'roles')!.template = this.rolesTemplate;
    this.loadStaff();
  }

  ngOnChanges() {
    this.loadStaff();
  }

  loadStaff() {
    if (!this.restaurantId) return;

    const source$ = this.showDisabled
      ? this.restaurantStaffService.getDisabledStaff(this.restaurantId)
      : this.restaurantStaffService.getRestaurantStaff(this.restaurantId);

    source$.pipe(takeUntil(this.destroy$)).subscribe((users: User[]) => {
      this.staff = users.map((u) => ({
        ...u,
        fullname: `${u.lastname} ${u.name}`,
        rolesList: Object.keys(u.roles || {}).filter(
          (r) => (u.roles as Record<string, boolean>)[r]
        ),
      }));
    });
  }

  toggleDisabled() {
    this.showDisabled = !this.showDisabled;
    this.loadStaff();
  }

  disable(user: User) {
    this.dialogService
      .confirmDialog({
        title: 'Deshabilitar empleado',
        message: '¿Deseas deshabilitar este empleado?',
        type: 'confirm',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (ok) => {
        if (!ok || !user.uid) return;

        await this.restaurantStaffService.disableStaffMember(user.uid);
        this.dialogService.infoDialog('OK', 'Empleado deshabilitado.');
        this.loadStaff();
      });
  }

  enable(user: User) {
    this.dialogService
      .confirmDialog({
        title: 'Habilitar empleado',
        message: '¿Deseas volver a habilitar este empleado?',
        type: 'enable',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (ok) => {
        if (!ok || !user.uid) return;

        await this.restaurantStaffService.enableStaffMember(user.uid);
        this.dialogService.infoDialog('OK', 'Empleado habilitado.');
        this.loadStaff();
      });
  }

  async changeRole(user: User) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { user, modo: 'editar-usuario' },
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (!result || !user.uid) return;

    await this.userService.updateUser(user.uid, { roles: result.roles });
    this.dialogService.infoDialog('OK', 'Roles actualizados correctamente.');
    this.loadStaff();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
