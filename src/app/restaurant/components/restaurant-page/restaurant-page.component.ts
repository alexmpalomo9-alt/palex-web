import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { RestaurantDialogService } from '../../services/restaurant-dialog.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { RestaurantListComponent } from '../restaurant-list/restaurant-list.component';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [SharedModule, RestaurantListComponent],
  templateUrl: './restaurant-page.component.html',
  styleUrls: ['./restaurant-page.component.css'],
})
export class RestaurantPageComponent implements OnInit, OnDestroy {
  restaurants: Restaurant[] = [];
  showDisabledTable = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private restaurantService: RestaurantService,
    private restaurantDialogService: RestaurantDialogService,
    private dialogService: DialogService
  ) {}

  /* ---------------------------------------------------
   * INIT
  ---------------------------------------------------- */
  ngOnInit() {
    this.listenRestaurants();
  }

  /* ---------------------------------------------------
   * CLEANUP
  ---------------------------------------------------- */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ---------------------------------------------------
   * STREAM PRINCIPAL DE RESTAURANTES
  ---------------------------------------------------- */
  private listenRestaurants() {
    this.restaurantService
      .getRestaurantsByStatus(!this.showDisabledTable)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.restaurants = data));
  }

  private reloadStream() {
    this.destroy$.next();      // corta flujo actual
    this.listenRestaurants();  // inicia nuevo listener
  }

  /* ---------------------------------------------------
   * NAVEGACIÓN
  ---------------------------------------------------- */
  goToRestaurantDetail(slug: string) {
    this.router.navigate(['/restaurant', slug]);
  }

  /* ---------------------------------------------------
   * CREAR RESTAURANTE
  ---------------------------------------------------- */
  addRestaurant() {
    this.restaurantDialogService
      .openRestaurantDialog({ mode: 'create' })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (result) => {
        if (!result) return;

        try {
          const newRes = await this.restaurantService.createRestaurant(result);

          this.dialogService.infoDialog('Éxito', 'Restaurante creado.');

          // Firestore emitirá update → no hace falta reload
          this.goToRestaurantDetail(newRes.slug);
        } catch (e: any) {
          this.dialogService.errorDialog('Error', e.message);
        }
      });
  }

  /* ---------------------------------------------------
   * CAMBIAR TABLA (habilitados / deshabilitados)
  ---------------------------------------------------- */
  showRestaurantTable() {
    this.showDisabledTable = !this.showDisabledTable;
    this.reloadStream();
  }

  /* ---------------------------------------------------
   * EDITAR
  ---------------------------------------------------- */
  onEdit(restaurant: Restaurant) {
    this.restaurantDialogService
      .openRestaurantDialog({ mode: 'edit', data: restaurant })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (result) => {
        if (!result) return;

        try {
          await this.restaurantService.updateRestaurantData(
            restaurant.restaurantId,
            result
          );

          this.dialogService.infoDialog('Éxito', 'Datos actualizados.');

          // Firestore emitirá update → no recargamos
        } catch {
          this.dialogService.errorDialog(
            'Error',
            'No se pudo actualizar el restaurante.'
          );
        }
      });
  }

  /* ---------------------------------------------------
   * DESHABILITAR
  ---------------------------------------------------- */
  onRemove(restaurant: Restaurant) {
    this.dialogService
      .confirmDialog({
        title: 'Dar de baja restaurante',
        message: '¿Deseas deshabilitarlo?',
        type: 'question',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (ok) => {
        if (!ok) return;
        await this.restaurantService.disableRestaurant(restaurant.restaurantId);
        this.dialogService.infoDialog('Éxito', 'Restaurante deshabilitado.');
      });
  }

  /* ---------------------------------------------------
   * HABILITAR
  ---------------------------------------------------- */
  onEnable(restaurant: Restaurant) {
    this.dialogService
      .confirmDialog({
        title: 'Reactivar restaurante',
        message: '¿Deseas habilitarlo?',
        type: 'question',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (ok) => {
        if (!ok) return;
        await this.restaurantService.enableRestaurant(restaurant.restaurantId);
        this.dialogService.infoDialog('Éxito', 'Restaurante habilitado.');
      });
  }

  /* ---------------------------------------------------
   * Extra compatibilidad
  ---------------------------------------------------- */
  onDisable(restaurant: Restaurant) {
    this.restaurantService.disableRestaurant(restaurant.restaurantId);
  }
}
