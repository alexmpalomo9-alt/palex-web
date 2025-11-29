import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../../model/restaurant.model';

@Component({
  selector: 'app-restaurant-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-header.component.html',
  styleUrls: ['./restaurant-header.component.scss'],
})
export class RestaurantHeaderComponent {
  @Input() restaurant: Restaurant | null = null;
}
