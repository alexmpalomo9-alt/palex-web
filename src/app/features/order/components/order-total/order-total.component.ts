import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-order-total',
  imports: [CommonModule],
  templateUrl: './order-total.component.html',
  styleUrl: './order-total.component.scss',
  standalone: true,
})
export class OrderTotalComponent {
  @Input() total: number = 0;
}
