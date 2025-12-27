import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { SharedModule } from '../../../../shared/shared.module';
import { CartService } from '../../../../customer/services/cart.service';
import { ProductService } from '../../../../products/services/product.service';
import { CategoryService } from '../../categories/services/category.service';
import { Product } from '../../../../products/model/product.model';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { CartComponent } from '../../../../customer/components/cart/cart/cart.component';
import { MenuSelectorComponent } from '../../../../menu/menu-selector/menu-selector.component';
import { Category } from '../../categories/model/category.model';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { TableService } from '../../restaurant-tables/services/table.service';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [CartComponent, SharedModule, MenuSelectorComponent],
  templateUrl: './restaurant-menu.component.html',
  styleUrls: ['./restaurant-menu.component.scss'],
})
export class RestaurantMenuComponent implements OnInit, OnDestroy {
  @ViewChild('cartSidenav') cartSidenav!: MatSidenav;

  private destroy$ = new Subject<void>();

  restaurant$!: Observable<Restaurant | null>;
  restaurantId!: string;
  tableId = '';
  tableNumber?: number;
  tableName?: string;

  isQrFlow = false;

  cartQuantity$!: Observable<number>;
  offerProducts$!: Observable<Product[]>;
  isDarkMode = false;

  categories: {
    label: string;
    icon?: string | null;
    categoryId: string;
    products$: Observable<Product[]>;
  }[] = [];

  selectedImage: string | null = null;
  menuType: 'traditional' | 'palex' = 'traditional';

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private categoryService: CategoryService,
    private productsService: ProductService,
    private cartService: CartService,
    private themeService: ThemeService,
    private tableService: TableService
  ) {}

  ngOnInit(): void {
    this.cartQuantity$ = this.cartService.totalQuantity$;
    this.loadRestaurantAndMenu();

    this.themeService.darkModeObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => (this.isDarkMode = value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRestaurantAndMenu() {
    this.restaurant$ = this.route.paramMap.pipe(
      tap((params) => {
        const tableId = params.get('tableId');

        this.isQrFlow = !!tableId;
        this.tableId = tableId ?? '';
      }),
      switchMap((params) => {
        const slug = params.get('slug');
        if (!slug) return of(null);
        return this.restaurantService.getRestaurantBySlug(slug);
      }),
      tap((restaurant) => {
        if (!restaurant) return;

        this.restaurantId = restaurant.restaurantId!;

        // limpiar carrito si cambia de restaurant
        const current = this.cartService.getCurrentRestaurantId();
        if (current && current !== this.restaurantId) {
          this.cartService.clearCart();
        }

        // cargar menú
        this.loadCategoriesFromFirestore();

        this.offerProducts$ = this.productsService.getOfferProducts(
          this.restaurantId
        );

        this.menuType = restaurant.menuType || 'palex';

        // 👇👇👇 ACA RESOLVÉS LA MESA (solo si hay QR)
        if (this.isQrFlow && this.tableId) {
          this.resolveTable();
        }
      }),
      takeUntil(this.destroy$)
    );
  }
  private resolveTable() {
    this.tableService
      .getTableById(this.restaurantId, this.tableId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((table) => {
        if (!table) return;

        this.tableNumber = table.number;
        this.tableName = table.name;
      });
  }

  private loadCategoriesFromFirestore() {
    this.categoryService
      .getCategories(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((categoriesFS: Category[]) => {
        this.categories = categoriesFS.map((c) => ({
          label: c.name,
          icon: c.icon ?? null,
          categoryId: c.categoryId,
          products$: this.productsService.getProductsByCategory(
            this.restaurantId,
            c.categoryId
          ) as Observable<Product[]>,
        }));
      });
  }

  addProductToCart(product: Product) {
    this.cartService.addProduct(product, this.restaurantId);
  }

  openImageModal(imageUrl?: string) {
    this.selectedImage = imageUrl ?? null;
  }

  closeImageModal() {
    this.selectedImage = null;
  }
}
