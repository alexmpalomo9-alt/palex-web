import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-order-dialog-header',
  imports: [SharedModule],
  templateUrl: './order-dialog-header.component.html',
  styleUrl: './order-dialog-header.component.scss',
  standalone: true,
})
export class OrderDialogHeaderComponent {
  @Input() tableNumber: number | null = null;
  @Input() statusLabel: string | null = null;

  @Output() addItem = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
