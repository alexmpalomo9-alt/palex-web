import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgForOf } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-role-permissions-info',
  standalone: true,
  imports: [SharedModule, MatTooltipModule],
  templateUrl: './role-permissions-info.component.html',
  styleUrls: ['./role-permissions-info.component.scss'],
})
export class RolePermissionsInfoComponent {
  columns = ['permission', 'propietario', 'encargado', 'mozo', 'cocina'];

  permissions = [
    {
      permission: 'Ver pedidos',
      description: 'Puede ver la lista completa de pedidos del restaurante.',
      propietario: true,
      encargado: true,
      mozo: true,
      cocina: true,
    },
    {
      permission: 'Tomar pedidos',
      description: 'Puede generar pedidos nuevos.',
      propietario: true,
      encargado: true,
      mozo: true,
      cocina: false,
    },
    {
      permission: 'Cancelar pedidos',
      description: 'Puede cancelar pedidos en curso.',
      propietario: true,
      encargado: true,
      mozo: true,
      cocina: false,
    },
    {
      permission: 'Editar menú',
      description: 'Crear, editar o eliminar productos del menú.',
      propietario: true,
      encargado: true,
      mozo: false,
      cocina: false,
    },
    {
      permission: 'Cambiar precios',
      description: 'Puede modificar precios de los productos.',
      propietario: true,
      encargado: true,
      mozo: false,
      cocina: false,
    },
    {
      permission: 'Ver estadísticas',
      description: 'Puede ver métricas de ventas y desempeño.',
      propietario: true,
      encargado: true,
      mozo: false,
      cocina: false,
    },
    {
      permission: 'Invitar personal',
      description: 'Puede invitar nuevos empleados al restaurante.',
      propietario: true,
      encargado: false,
      mozo: false,
      cocina: false,
    }
  ];
}
