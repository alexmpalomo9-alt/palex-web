import { Routes } from '@angular/router';
import { HomePageComponent } from './customer/components/home-page/home-page.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/routes/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: 'restaurant',
    loadChildren: () =>
      import('./restaurant/routes/restaurant.routes').then(
        (m) => m.RESTAURANT_ROUTES
      ),
  },

  {
    path: 'cart',
    loadComponent: () =>
      import('./customer/components/cart/cart.component').then(
        (c) => c.CartComponent
      ),
  },

  { path: '', component: HomePageComponent },
];
