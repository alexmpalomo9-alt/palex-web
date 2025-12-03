import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../products/model/product.model';
import { Restaurant } from '../../features/restaurant/model/restaurant.model';
import { MenuTraditionalComponent } from '../../menu/menu-tradicional/menu-tradicional.component';
import { MenuPalexComponent } from '../../menu/menu-palex/menu-palex.component';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu-selector',
  standalone: true,
  templateUrl: './menu-selector.component.html',
  styleUrls: ['./menu-selector.component.scss'],
  imports: [CommonModule, MenuTraditionalComponent, MenuPalexComponent]
})
export class MenuSelectorComponent {
  @Input() restaurant!: Restaurant | null;
  @Input() categories!: { label: string; products$: Observable<Product[]> }[];
  @Input() offerProducts$!: Observable<Product[]>;
  @Input() menuType: 'traditional' | 'palex' = 'traditional';

  @Output() addProduct = new EventEmitter<Product>();
  @Output() openImage = new EventEmitter<string>();
}
