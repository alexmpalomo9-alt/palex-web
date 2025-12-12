import { Injectable } from '@angular/core';
import { TableStatus } from '../../../features/restaurant/restaurant-tables/model/tables.model';

@Injectable({
  providedIn: 'root',
})
export class TableStatusService {
  constructor() {}

  getTableStatusLabel(status: TableStatus): string {
    switch (status) {
      case 'available':
        return 'Mesa Disponible';
      case 'seated':
        return 'En espera';
      case 'occupied':
        return 'Mesa Ocupada';
      case 'reserved':
        return 'Mesa reservada';
      default:
        return status;
    }
  }
}
