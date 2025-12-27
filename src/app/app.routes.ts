import { Routes } from '@angular/router';
import { HomePageComponent } from './customer/components/home-page/home-page.component';
import { InviteGuard } from './core/guards/invite.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicShellComponent } from './customer/components/shell/public-shell/public-shell.component';
import { RestaurantMenuComponent } from './features/restaurant/restaurant-menu/restaurant-menu/restaurant-menu.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      { path: '', component: HomePageComponent },

      // Menú público
      { path: 'restaurant/:slug/menu', component: RestaurantMenuComponent },  // Ruta normal (cualquier persona)
      { path: 'r/:slug/menu/:tableId', component: RestaurantMenuComponent },  // Ruta que acceden con código QR

      // Invitaciones
      {
        path: 'invite/:token',
        canActivate: [InviteGuard],
        loadComponent: () =>
          import('./features/invitations/pages/invite-page/invite-page.component').then(
            (m) => m.InvitePageComponent
          ),
      },

      // 🔐 AUTH (ACÁ DENTRO)
      {
        path: 'auth',
        loadChildren: () =>
          import('./auth/routes/auth.routes').then((m) => m.AUTH_ROUTES),
      },

      // 👤 USERS
      {
        path: 'users',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./users/routes/user.routes').then((m) => m.USER_ROUTES),
      },
    ],
  },

  // Operación restaurante (shell propio)
  {
    path: 'restaurant',
    loadChildren: () =>
      import('./features/restaurant/routes/restaurant.routes').then(
        (m) => m.RESTAURANT_ROUTES
      ),
  },

  // Carrito
  {
    path: 'cart',
    loadComponent: () =>
      import('./customer/components/cart/cart/cart.component').then(
        (c) => c.CartComponent
      ),
  },
];
