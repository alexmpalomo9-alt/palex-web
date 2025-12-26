import { Injectable } from '@angular/core';
import { Table } from '../../model/tables.model';

@Injectable({
  providedIn: 'root', // Esto asegura que el servicio sea accesible globalmente
})
export class TableStatusService {
  constructor() {}

  // Obtener etiqueta del estado de la mesa
  getTableStatusLabel(table: Table): string {
    switch (table.status) {
      case 'available':
        return 'Disponible';
      case 'seated':
        return 'En espera';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      default:
        return 'Desconocido';
    }
  }

  // Obtener color del estado de la mesa
  getTableStatusColor(table: Table): string {
    switch (table.status) {
      case 'available':
        return 'rgba(29, 139, 69, 0.95)'; // Verde (mesa disponible)
      case 'seated':
        return 'rgba(251, 146, 60, 0.95)'; // Naranja (mesa ocupada pero sin pedido)
      case 'occupied':
        return 'rgba(239, 68, 68, 0.95)'; // Rojo (mesa con pedido activo)
      case 'reserved':
        return 'rgba(59, 130, 246, 0.95)'; // Azul (mesa reservada)
      default:
        return 'rgba(100, 116, 139, 0.95)'; // Gris (estado desconocido)
    }
  }
}
