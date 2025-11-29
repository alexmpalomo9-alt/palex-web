import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-restaurant-stats',
  templateUrl: './restaurant-stats.component.html',
  styleUrls: ['./restaurant-stats.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class RestaurantStatsComponent {
  @Input() rating = 0;
  @Input() totalMenuItems = 0;
  @Input() totalComments = 0;
  @Input() monthlyViews = 0;
}
