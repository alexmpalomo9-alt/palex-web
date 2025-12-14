import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-order-dialog-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-dialog-header.component.html',
  styleUrls: ['./order-dialog-header.component.scss']
})
export class OrderDialogHeaderComponent {
  @Input() tableNumbers: number[] = [];
  @Input() statusLabel!: string;

  @Output() addItem = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isDarkMode = false;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {
    this.themeService.darkModeObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.isDarkMode = value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
