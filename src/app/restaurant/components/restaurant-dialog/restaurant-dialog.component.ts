import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  RestaurantDialogData,
  RestaurantDialogMode,
} from '../../model/restaurant.model';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { regexAlfanumericoConEspacios, regexDescripcion, regexDireccion, regexNumeros, regexTelefono, regexTextos } from '../../../shared/pattern/patterns';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-restaurant-dialog',
  standalone: true,
  imports: [SharedModule, MatButtonToggleModule],
  templateUrl: './restaurant-dialog.component.html',
  styleUrls: ['./restaurant-dialog.component.css'],
})
export class RestaurantDialogComponent {
  editForm: FormGroup;
  mode!: RestaurantDialogMode;

  constructor(
    private dialogRef: MatDialogRef<RestaurantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RestaurantDialogData
  ) {
    this.mode = data.mode;

    const r = data.restaurant ?? {
      name: '',
      phone: '',
      address: '',
      addressNumber: 0,
      description: '',
      openingHours: '',
      enabled: true,
      imageLogo: '',
      mainImage: '',
    };

    this.editForm = new FormGroup({
      name: new FormControl(r.name, [
        Validators.required,
        Validators.pattern(regexAlfanumericoConEspacios),
      ]),
      phone: new FormControl(r.phone, [
        Validators.required, // AGREGADO
        Validators.pattern(regexTelefono),
      ]),
      description: new FormControl(r.description, [
        Validators.required, // AGREGADO
        Validators.pattern(regexDescripcion),
      ]),
      address: new FormControl(r.address, [
        Validators.required,
        Validators.pattern(regexDireccion),
      ]),
      addressNumber: new FormControl(r.addressNumber, [
        Validators.required,
        Validators.pattern(regexNumeros),
      ]),
      openingHours: new FormControl(r.openingHours),
      enabled: new FormControl(r.enabled),
      imageLogo: new FormControl(r.imageLogo),
      mainImage: new FormControl(r.mainImage),
    });
  }

  saveRestaurant() {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formData = { ...this.editForm.value };

    formData.addressNumber = Number(formData.addressNumber);

    if (this.mode === 'edit') {
      formData.restaurantId = this.data.restaurant?.restaurantId;
    }

    this.dialogRef.close(formData);
  }

  cancel() {
    this.dialogRef.close();
  }
}
