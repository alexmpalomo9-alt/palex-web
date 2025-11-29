import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
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

  @ViewChild('rolesTemplate', { static: true })
  rolesTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate!: TemplateRef<any>;

  columns: BaseColumn[] = [
    { id: 'fullname', label: 'Nombre' },
    { id: 'email', label: 'Email' },
    { id: 'roles', label: 'Roles', template: null },
  ];

  constructor(
    private route: ActivatedRoute,
    private staffService: RestaurantStaffService
  ) {}

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

    this.staffService
      .getRestaurantEmployeesBySlug(this.restaurantId, this.showDisabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.staff = users.map((u) => ({
          ...u,
          fullname: `${u.name} ${u.lastname}`,
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
    this.staffService.disableStaffMember(user.uid).then(() => this.loadStaff());
  }

  enable(user: User) {
    this.staffService.enableStaffMember(user.uid).then(() => this.loadStaff());
  }

  changeRole(user: User) {
    // Aquí podés abrir un dialog como antes para editar roles
    console.log('Editar roles de', user);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
