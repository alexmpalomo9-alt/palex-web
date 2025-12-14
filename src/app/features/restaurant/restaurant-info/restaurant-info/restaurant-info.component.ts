import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantDialogService } from '../../services/restaurant-dialog.service';
import { RestaurantService } from '../../services/restaurant.service';
import { ActivatedRoute } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { DialogService } from '../../../../core/services/dialog-service/dialog.service';

@Component({
  selector: 'app-restaurant-info',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './restaurant-info.component.html',
  styleUrls: ['./restaurant-info.component.scss'],
})
export class RestaurantInfoComponent {
  @Input() restaurant: Restaurant | null = null;

  constructor(
    private restaurantDialogService: RestaurantDialogService,
    private restaurantService: RestaurantService,
    private dialogService: DialogService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('restaurantId');
    if (!slug) return;

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
          this.dialogService.infoDialog(
            'Cancelar',
            'No se realizaron cambios.'
          );
          return;
        }

        try {
          await this.restaurantService.updateRestaurantData(
            this.restaurant!.restaurantId!,
            result
          );
          this.dialogService.infoDialog(
            'Éxito',
            'Perfil actualizado correctamente.'
          );
        } catch (e: any) {
          this.dialogService.errorDialog(
            'Error',
            e.message || 'Ocurrió un error inesperado.'
          );
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
      console.log('Tipo de menú actualizado:', type);
    } catch (err) {
      console.error('Error al actualizar menú:', err);
    }
  }
}
