import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: string): Date | null {
    if (!value) return null;

    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Meses 0-indexados
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  }

  override format(date: Date, displayFormat: Object): string {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Ajustar para mostrar 1-indexado
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
