import { Component, Input } from '@angular/core';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantDialogService } from '../../services/restaurant-dialog.service';
import { RestaurantService } from '../../services/restaurant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { DialogService } from '../../../../core/services/dialog-service/dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UiFeedbackService } from '../../../../shared/services/ui-feedback/ui-feedback.service';

@Component({
  selector: 'app-restaurant-info',
  standalone: true,
  imports: [SharedModule, AddButtonComponent],
  templateUrl: './restaurant-info.component.html',
  styleUrls: ['./restaurant-info.component.scss'],
})
export class RestaurantInfoComponent {
  @Input() restaurant: Restaurant | null = null;

  constructor(
    private restaurantDialogService: RestaurantDialogService,
    private restaurantService: RestaurantService,
    private uiFeedback: UiFeedbackService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      const slug = params.get('restaurantId');
      if (!slug) return;

      this.loadRestaurant(slug);
    });
  }

  private loadRestaurant(slug: string) {
    this.restaurantService.getRestaurantBySlug(slug).subscribe((restaurant) => {
      if (!restaurant) return;

      this.restaurant = restaurant;

      if (this.restaurant.createdAt instanceof Timestamp) {
        this.restaurant.createdAt = this.restaurant.createdAt.toDate();
      }

      if (this.restaurant.updatedAt instanceof Timestamp) {
        this.restaurant.updatedAt = this.restaurant.updatedAt.toDate();
      }
    });
  }

  editRestaurant() {
    if (!this.restaurant) return;

    this.restaurantDialogService
      .openRestaurantDialog({ mode: 'edit', data: this.restaurant })
      .subscribe(async (result) => {
        if (!result) {
          this.uiFeedback.show('No se realizaron cambios.', 'info');
          return;
        }

        try {
          await this.restaurantService.updateRestaurantData(
            this.restaurant!.restaurantId!,
            result
          );

          if (result.name && result.name !== this.restaurant!.name) {
            const newSlug = await this.restaurantService.generateUniqueSlug(
              result.name,
              this.restaurant!.restaurantId!
            );

            this.router.navigate(['/restaurant', newSlug, 'info']);
          }

          this.uiFeedback.show('Perfil actualizado correctamente.', 'success');
        } catch (e: any) {
          this.uiFeedback.show('Ocurrió un error inesperado.', 'error');
        }
      });
  }

  // ✅ Función para cambiar el tipo de menú
  async changeMenuType(type: 'traditional' | 'palex') {
    if (!this.restaurant) return;

    this.restaurant.menuType = type;

    try {
      await this.restaurantService.updateRestaurantData(
        this.restaurant.restaurantId!,
        { menuType: type }
      );
      // console.log('Tipo de menú actualizado:', type);
    } catch (err) {
      console.error('Error al actualizar menú:', err);
    }
  }
}
