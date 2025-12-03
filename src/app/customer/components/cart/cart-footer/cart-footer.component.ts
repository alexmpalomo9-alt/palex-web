import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cart-footer',
  imports: [],
  templateUrl: './cart-footer.component.html',
  styleUrl: './cart-footer.component.scss'
})
export class CartFooterComponent {
  @Input() total!: number;
  @Output() checkout = new EventEmitter<void>();
}
