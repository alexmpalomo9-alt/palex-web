                ┌────────────────────────┐
                │ restaurant-menu        │
                │ (RestaurantMenuComponent)
                └──────────────┬─────────┘
                               │
                               │ addProductToCart(product)
                               ▼
                    ┌───────────────────────────┐
                    │ CartService               │
                    │ (estado central del cart) │
                    └──────────────┬────────────┘
                                   │
                      updateCart() │ saveToStorage()
                                   │
                                   ▼
                        ┌────────────────────┐
                        │ BehaviorSubject    │
                        │ cart$              │
                        └───┬────────────────┘
                            │  (flujo reactivo)
                            │
           ┌────────────────┴──────────────────────┐
           ▼                                       ▼
 ┌────────────────────────┐               ┌────────────────────────┐
 │ <app-cart>             │  ← remove/increase/decrease → CartService
 │ CartComponent          │               │
 └────────────┬──────────┘               │
              │                          │
           *ngFor                       updateCart()
              │                          │
              ▼                          ▼
      ┌───────────────────────┐   ┌─────────────────────────┐
      │ <app-cart-item>       │   │ localStorage (sync)     │
      │ CartItemComponent     │   └─────────────────────────┘
      └──────────┬────────────┘
                 │ events:
                 │ increase.emit(item)
                 │ decrease.emit(item)
                 │ remove.emit(item)
                 ▼
           Back a CartComponent
           y luego a CartService
