import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { Observable } from "rxjs";
import { Restaurant } from "../../features/restaurant/model/restaurant.model";
import { Product } from "../../products/model/product.model";
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-menu-traditional',
  standalone: true,
  templateUrl: './menu-tradicional.component.html', // revisa que coincida con el archivo
  styleUrls: ['./menu-tradicional.component.scss'],
  imports: [
    CommonModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ]
})
export class MenuTraditionalComponent {
  @Input() restaurant!: Restaurant | null;
  @Input() categories!: { label: string; products$: Observable<Product[]> }[];
  @Input() offerProducts$!: Observable<Product[]>;

  @Output() addProduct = new EventEmitter<Product>();
  @Output() openImage = new EventEmitter<string>();
  

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
