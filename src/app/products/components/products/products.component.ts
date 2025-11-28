import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Product, PRODUCT_CATEGORIES } from '../../model/product.model';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Restaurant } from '../../../restaurant/model/restaurant.model';
import { RestaurantService } from '../../../restaurant/services/restaurant.service';
import { CartService } from '../../../customer/services/cart.service';
import { SharedModule } from '../../../shared/shared.module';
import { CartComponent } from '../../../customer/components/cart/cart.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CartComponent, SharedModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  @ViewChild('cartSidenav') cartSidenav!: MatSidenav;
  private destroy$ = new Subject<void>();
  selectedImage: string | null = null;
  categories: { label: string; products$: Observable<Product[]> }[] = [];
  offerProducts$!: Observable<Product[]>;
  restaurant: Restaurant | null = null;

  constructor(
    private productsService: ProductService,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.initializeProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeProducts() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) return [];
          return this.restaurantService.getRestaurantBySlug(slug);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((restaurantResult) => {
        const restaurant = Array.isArray(restaurantResult)
          ? restaurantResult[0]
          : restaurantResult;
        if (!restaurant) return;
        this.restaurant = restaurant;
        const restaurantId = restaurant.restaurantId!;

        // ----- 🔥 Resetear carrito si cambia de restaurante -----
        const currentCartRestaurant = this.cartService.getCurrentRestaurantId();
        if (currentCartRestaurant && currentCartRestaurant !== restaurantId) {
          this.cartService.clearCart();
        }
        this.categories = PRODUCT_CATEGORIES.map((label) => ({
          label,
          products$: this.productsService.getAvailableProductsByCategory(
            restaurantId,
            label
          ),
        }));
        this.offerProducts$ =
          this.productsService.getOfferProducts(restaurantId);
      });
  }

  /** Agregar producto usando el servicio */
  addProductToCart(product: Product) {
    if (!this.restaurant) return;
    const restaurantId = this.restaurant.restaurantId!;
    this.cartService.addProduct(product, restaurantId);
  }

  getCartQuantity(): number {
    return this.cartService.getTotalQuantity();
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
