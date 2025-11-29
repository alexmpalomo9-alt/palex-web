import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-restaurant-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SharedModule],
  templateUrl: './restaurant-nav.component.html',
  styleUrls: ['./restaurant-nav.component.scss'],
})
export class RestaurantNavComponent {}
