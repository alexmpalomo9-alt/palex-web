import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../../model/cart.model';
import { SharedModule } from '../../../../shared/shared.module';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class CartItemComponent {
  @Input() item!: CartItem;

  @Output() increase = new EventEmitter<CartItem>();
  @Output() decrease = new EventEmitter<CartItem>();
  @Output() remove = new EventEmitter<CartItem>();
}
