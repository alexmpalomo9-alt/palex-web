import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { Restaurant } from '../../../features/restaurant/model/restaurant.model';
import { RestaurantService } from '../../../features/restaurant/services/restaurant.service';
import { ThemeService } from '../../../core/services/theme/theme.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [SharedModule, SearchBoxComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  @Input() restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  isDarkMode: boolean;

  private sub?: Subscription;
  private destroy$ = new Subject<void>();

  private restaurantService = inject(RestaurantService);
  private router = inject(Router);

  constructor(private themeService: ThemeService) {
    this.isDarkMode = this.themeService.getDarkMode();
  }

  ngOnInit() {
    this.sub = this.restaurantService
      .getRestaurantsByStatus(true)
      .subscribe((data: Restaurant[]) => {
        this.restaurants = data;
        this.filteredRestaurants = [...data];
      });
    this.themeService.darkModeObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.isDarkMode = value);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  openRestaurant(slug: string) {
    this.router.navigate(['/restaurant', slug, 'menu']);
  }

  onSearch(term: string) {
    term = term.toLowerCase().trim();
    this.filteredRestaurants = this.restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.category?.toLowerCase().includes(term)
    );
  }
}
