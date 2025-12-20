import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SearchBoxComponent } from '../../../../../shared/components/search-box/search-box.component';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, SearchBoxComponent],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss'],
})
export class SectionHeaderComponent {
  @Input() icon: string = 'info';
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() sticky = true;
  @Input() filterPlaceholder?: string;

  @Output() search = new EventEmitter<string>();
}
