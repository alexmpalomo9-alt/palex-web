import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../products/model/product.model';
import { Restaurant } from '../../features/restaurant/model/restaurant.model';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-menu-palex',
  standalone: true,
  imports: [CommonModule, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './menu-palex.component.html',
  styleUrls: ['./menu-palex.component.scss'],
})
export class MenuPalexComponent implements OnInit {
  @Input() restaurant!: Restaurant | null;
  @Input() categories!: { label: string; products$: Observable<Product[]> }[];
  @Input() offerProducts$!: Observable<Product[]>;

  @Output() addProduct = new EventEmitter<Product>();
  @Output() openImage = new EventEmitter<string>();

  selectedCategoryIndex = 0;
  currentProducts$!: Observable<Product[]>;

  allCategories: { label: string; products$: Observable<Product[]> }[] = [];

  ngOnInit() {
    this.updateCategories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categories'] || changes['offerProducts$']) {
      this.updateCategories();
    }
  }

  private updateCategories() {
    if (!this.categories) return;

    this.allCategories = [
      { label: '🔥 Ofertas', products$: this.offerProducts$ },
      ...this.categories,
    ];

    this.loadCategoryProducts();
  }

  selectCategory(index: number) {
    this.selectedCategoryIndex = index;
    this.loadCategoryProducts();
  }

  loadCategoryProducts() {
    if (this.allCategories.length === 0) return;
    this.currentProducts$ =
      this.allCategories[this.selectedCategoryIndex].products$;
  }

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
