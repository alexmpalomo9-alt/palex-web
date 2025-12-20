import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-order-dialog-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-dialog-header.component.html',
  styleUrls: ['./order-dialog-header.component.scss'],
})
export class OrderDialogHeaderComponent {
  @Input() tableNumbers: number[] = [];
  @Input() statusLabel!: string;

  @Output() addItem = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get tableLabel(): string {
    if (!this.tableNumbers?.length) return '---';
    if (this.tableNumbers.length === 1) return `Mesa: ${this.tableNumbers[0]}`;
    return `Mesas: ${this.tableNumbers.join(', ')}`;
  }
}
