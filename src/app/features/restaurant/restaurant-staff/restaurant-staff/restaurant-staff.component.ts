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

@Component({
  selector: 'app-restaurant-staff',
  standalone: true,
  imports: [SharedModule, BaseTableComponent, MatChipsModule],
  templateUrl: './restaurant-staff.component.html',
  styleUrl: './restaurant-staff.component.scss',
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

    // Obtenemos restaurantId desde la ruta padre
    this.restaurantId =
      this.route.parent?.snapshot.paramMap.get('restaurantId') ?? '';
    if (this.restaurantId) {
      this.loadStaff();
    }
  }

  loadStaff() {
    if (!this.restaurantId) return;
    this.restaurantStaffService
      .getRestaurantEmployeesBySlug(this.restaurantId, this.showDisabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.staff = users.map((u) => ({
          ...u,
          fullname: `${u.name} ${u.lastname}`,
          // FILTRAMOS SOLO ROLES INTERNOS
          rolesList: Object.keys(u.roles || {})
            .filter((r) => (u.roles as Record<string, boolean>)[r])
            .filter((r) => this.internalRoles.includes(r)),
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
        type: 'question',
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
    this.restaurantStaffService
      .enableStaffMember(user.uid)
      .then(() => this.loadStaff());
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

  private internalRoles = [
    'adminGlobal',
    'adminLocal',
    'mozo',
    'cocina',
    'gerencia',
  ];
}
