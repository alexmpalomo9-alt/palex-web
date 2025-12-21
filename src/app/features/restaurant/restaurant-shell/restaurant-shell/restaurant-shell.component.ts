import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RestaurantNavComponent } from '../../restaurant-nav/restaurant-nav/restaurant-nav.component';
import { RestaurantService } from '../../services/restaurant.service';
import { SharedModule } from '../../../../shared/shared.module';
import { NavbarComponent } from '../../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-restaurant-shell',
  standalone: true,
  imports: [RestaurantNavComponent, SharedModule, RouterModule, NavbarComponent],
  templateUrl: './restaurant-shell.component.html',
  styleUrls: ['./restaurant-shell.component.scss'],
})
export class RestaurantShellComponent implements OnInit {
  restaurant: any; // Info del restaurante obtenida por slug

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  // Detecta si la ventana tiene tamaño mobile (< 1000px)
  isMobile = window.innerWidth < 1000;

  // Se ejecuta cuando el usuario cambia el tamaño de la ventana
  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1000;
  }

  ngOnInit() {
    // Obtiene el parámetro del URL: /restaurant/:slug
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;

      // Busca el restaurante por slug
      this.restaurantService
        .getRestaurantBySlug(slug)
        .subscribe((restaurant) => {
          if (!restaurant) return;

          this.restaurant = restaurant;

          console.log('RESTAURANT CARGADO EN PADRE:', this.restaurant);
          console.log('RESTAURANT ID EN PADRE:', this.restaurant.restaurantId);
        });
    });
  }
}
