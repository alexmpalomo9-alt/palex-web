import { Routes } from '@angular/router';
import { RestaurantInfoComponent } from '../restaurant-info/restaurant-info/restaurant-info.component';
import { RestaurantMenuComponent } from '../restaurant-menu/restaurant-menu/restaurant-menu.component';
import { RestaurantStaffComponent } from '../restaurant-staff/restaurant-staff/restaurant-staff.component';
import { RestaurantStatsComponent } from '../restaurant-stats/restaurant-stats/restaurant-stats.component';
import { RestaurantTablesComponent } from '../restaurant-tables/restaurant-tables/restaurant-tables.component';
import { RestaurantShellComponent } from '../restaurant-shell/restaurant-shell/restaurant-shell.component';
import { RestaurantProductsComponent } from '../restaurant-products/restaurant-products/restaurant-products.component';
import { RestaurantTablesCardComponent } from '../restaurant-tables/restaurant-tables-card/restaurant-tables-card.component';
import { RestaurantKitchenComponent } from '../restaurant-kitchen/restaurant-kitchen/restaurant-kitchen.component';
import { CategoryManagementComponent } from '../categories/components/category-management/category-management.component';

export const RESTAURANT_ROUTES: Routes = [
  {
    path: ':restaurantId',
    component: RestaurantShellComponent,
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },

      { path: 'info', component: RestaurantInfoComponent },
      { path: 'products', component: RestaurantProductsComponent },
      { path: 'staff', component: RestaurantStaffComponent },
      { path: 'tables', component: RestaurantTablesComponent },
      { path: 'stats', component: RestaurantStatsComponent },
      { path: 'kitchen', component: RestaurantKitchenComponent },
      { path: 'waiter', component: RestaurantTablesCardComponent },
      { path: 'categories', component: CategoryManagementComponent },
    ],
  },

  // cliente viendo menú por slug
  { path: ':slug/menu', component: RestaurantMenuComponent },

  // QR a mesa específica
  { path: 'r/:slug/menu/:tableId', component: RestaurantMenuComponent },
];
