import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { SharedModule } from '../../../../shared/shared.module';
import { CartService } from '../../../../customer/services/cart.service';
import { Product, PRODUCT_CATEGORIES } from '../../../../products/model/product.model';
import { ProductService } from '../../../../products/services/product.service';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { CartComponent } from '../../../../customer/components/cart/cart/cart.component';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [CartComponent, SharedModule],
  templateUrl: './restaurant-menu.component.html',
  styleUrls: ['./restaurant-menu.component.scss'],
})
export class RestaurantMenuComponent implements OnInit, OnDestroy {
  @ViewChild('cartSidenav') cartSidenav!: MatSidenav;

  private destroy$ = new Subject<void>();

  restaurant$!: Observable<Restaurant | null>;
  restaurantId!: string;

  cartQuantity$!: Observable<number>;

  offerProducts$!: Observable<Product[]>;
  categories: { label: string; products$: Observable<Product[]> }[] = [];

  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private productsService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartQuantity$ = this.cartService.totalQuantity$;
    this.loadRestaurantAndMenu();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRestaurantAndMenu() {
    this.restaurant$ = this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug');
        if (!slug) return of(null);
        return this.restaurantService.getRestaurantBySlug(slug);
      }),
      tap(restaurant => {
        if (!restaurant) return;

        this.restaurantId = restaurant.restaurantId!;

        const current = this.cartService.getCurrentRestaurantId();
        if (current && current !== this.restaurantId) {
          this.cartService.clearCart();
        }

        this.categories = PRODUCT_CATEGORIES.map(label => ({
          label,
          products$: this.productsService.getAvailableProductsByCategory(
            this.restaurantId,
            label
          ),
        }));

        this.offerProducts$ = this.productsService.getOfferProducts(this.restaurantId);
      }),
      takeUntil(this.destroy$)
    );
  }

  addProductToCart(product: Product) {
    if (!this.restaurantId) return;
    this.cartService.addProduct(product, this.restaurantId);
  }

  openImageModal(imageUrl?: string) {
    if (imageUrl) this.selectedImage = imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }

  onImageError(event: any) {
    event.target.src = 'assets/img/not-found.png';
  }
}
