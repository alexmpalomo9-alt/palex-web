import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme/theme.service';

// Angular Material
import { MatChipsModule } from '@angular/material/chips';
import { MatCommonModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
