import { Routes } from '@angular/router';
import { RestaurantPageComponent } from '../components/restaurant-page/restaurant-page.component';
import { ProductsComponent } from '../../products/components/products/products.component';
import { RestaurantProfileComponent } from '../components/restaurant-profile/restaurant-profile.component';

export const RESTAURANT_ROUTES: Routes = [
  { path: 'list', component: RestaurantPageComponent },
  { path: ':slug', component: RestaurantProfileComponent },
  {
    path: ':slug/menu',
    component: ProductsComponent,
  },
];
