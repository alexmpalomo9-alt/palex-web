import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../products/model/product.model';
import { Restaurant } from '../../features/restaurant/model/restaurant.model';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-menu-palex',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './menu-palex.component.html',
  styleUrls: ['./menu-palex.component.scss'],
})
export class MenuPalexComponent {
  @Input() restaurant!: Restaurant | null;

  // Cambiado para que acepte la misma estructura que MenuTraditionalComponent
  @Input() categories!: { label: string; products$: Observable<Product[]> }[];

  // Cambiado para trabajar con observable
  @Input() offerProducts$!: Observable<Product[]>;

  @Output() addProduct = new EventEmitter<Product>();
  @Output() openImage = new EventEmitter<string>();

  selectedImage?: string;

  onAddProduct(product: Product) {
    this.addProduct.emit(product);
  }

  onOpenImage(imageUrl?: string) {
    if (imageUrl) this.openImage.emit(imageUrl);
  }

  onImageError(event: any) {
    event.target.src = 'assets/img/not-found.png';
  }
}
