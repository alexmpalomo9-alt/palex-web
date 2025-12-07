import { Routes } from '@angular/router';
import { HomePageComponent } from './customer/components/home-page/home-page.component';
import { InviteGuard } from './core/guards/invite.guard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/routes/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // {
  //   path: 'restaurant',
  //   canActivate: [AuthGuard],                  // 🔐 Solo usuarios logueados
  //   data: { roles: ['adminLocal','adminGlobal','gerencia','mozo','cocina'] },
  //   loadChildren: () =>
  //     import('./features/restaurant/routes/restaurant.routes')
  //       .then(m => m.RESTAURANT_ROUTES),
  // },
  {
    path: 'restaurant',
    loadChildren: () =>
      import('./features/restaurant/routes/restaurant.routes').then(
        (m) => m.RESTAURANT_ROUTES
      ),
  },

  {
    path: 'cart',
    loadComponent: () =>
      import('./customer/components/cart/cart/cart.component').then(
        (c) => c.CartComponent
      ),
  },

  {
    path: 'users',
    canActivate: [AuthGuard], // 🔐 Solo usuarios logueados
    loadChildren: () =>
      import('./users/routes/user.routes').then((m) => m.USER_ROUTES),
  },

  { path: '', component: HomePageComponent },

  {
    path: 'invite/:token',
    canActivate: [InviteGuard], // 🎟 Token válido requerido
    loadComponent: () =>
      import(
        './features/invitations/pages/invite-page/invite-page.component'
      ).then((m) => m.InvitePageComponent),
  },
];
