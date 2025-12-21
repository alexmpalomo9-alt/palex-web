import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Product } from '../../products/model/product.model';
import { Restaurant } from '../../features/restaurant/model/restaurant.model';
import { SharedModule } from '../../shared/shared.module';
import { ThemeService } from '../../core/services/theme/theme.service';

@Component({
  selector: 'app-menu-palex',
  standalone: true,
  imports: [CommonModule, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './menu-palex.component.html',
  styleUrls: ['./menu-palex.component.scss'],
})
export class MenuPalexComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() restaurant!: Restaurant | null;
  @Input() categories!: { label: string; products$: Observable<Product[]> }[];
  @Input() offerProducts$!: Observable<Product[]>;

  @Output() addProduct = new EventEmitter<Product>();
  @Output() openImage = new EventEmitter<string>();

  @ViewChild('swiper', { static: false }) swiper?: ElementRef;

  selectedCategoryIndex = 0;
  currentProducts$!: Observable<Product[]>;
  isDarkMode = false;

  allCategories: { label: string; products$: Observable<Product[]> }[] = [];

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.updateCategories();
    this.themeService.darkModeObservable.subscribe(
      (value) => (this.isDarkMode = value)
    );
  }

  ngAfterViewInit() {
    setTimeout(() => this.centerSlide(), 200);
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
    setTimeout(() => this.centerSlide(), 100);
  }

  selectCategory(index: number) {
    this.selectedCategoryIndex = index;
    this.loadCategoryProducts();
    this.centerSlide();
  }

  private centerSlide() {
    const swiperEl = this.swiper?.nativeElement;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slideTo(this.selectedCategoryIndex);
    }
  }

  private loadCategoryProducts() {
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
