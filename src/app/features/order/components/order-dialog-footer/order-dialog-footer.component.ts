import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  standalone: true,
  selector: 'app-order-dialog-footer',
  templateUrl: './order-dialog-footer.component.html',
  styleUrl: './order-dialog-footer.component.scss',
  imports: [SharedModule],
})
export class OrderDialogFooterComponent {
  @Input() status: string = '';
  @Input() isEditMode = false;
  @Input() loading = false;

  @Output() create = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();
  @Output() closeOrder = new EventEmitter<void>();
  @Output() cancelOrder = new EventEmitter<void>();
}
