import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Restaurant } from '../model/restaurant.model';
import { RestaurantDialogComponent } from '../components/restaurant-dialog/restaurant-dialog.component';

type DialogMode = 'create' | 'edit';

@Injectable({
  providedIn: 'root',
})
export class RestaurantDialogService {
  constructor(private dialog: MatDialog) {}

  openRestaurantDialog(options: {
    mode: DialogMode;
    data?: Restaurant;
  }): Observable<Restaurant> {
    const dialogRef = this.dialog.open(RestaurantDialogComponent, {
      disableClose: true,
      width: '600px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
      data: {
        mode: options.mode,
        restaurant:
          options.mode === 'edit'
            ? options.data
            : {
                restaurantId: '',
                name: '',
                phone: '',
                description: '',
                addressNumber: 0,
                enabled: false,
                createdAt: new Date(),
                updatedAt: new Date().toISOString(),
                address: '',
                openingHours: '',
                cuisineType: '',
                imageLogo: '',
                mainImage: '',
              },
      },
    });

    return dialogRef.afterClosed();
  }
}
