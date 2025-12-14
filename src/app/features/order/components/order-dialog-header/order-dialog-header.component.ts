import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-order-dialog-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-dialog-header.component.html',
})
export class OrderDialogHeaderComponent {
  @Input() tableNumbers: number[] = [];
  @Input() statusLabel!: string;

  @Output() addItem = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
