import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconPickerComponent),
      multi: true
    }
  ]
})
export class IconPickerComponent implements ControlValueAccessor {
  value: string | null = null;
  disabled = false;

  icons = [
    'restaurant',
    'local_dining',
    'local_bar',
    'fastfood',
    'cake',
    'local_cafe',
    'icecream',
    'local_pizza',
    'ramen_dining',
    'no_drinks',
    'emoji_food_beverage',
    'takeout_dining'
  ];

  // callbacks proporcionados por Angular
  private onChange = (value: any) => {};
  private onTouched = () => {};

  // --------------------------
  // Métodos del ControlValueAccessor
  // --------------------------

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // --------------------------
  // Lógica del componente
  // --------------------------

  select(icon: string) {
    if (this.disabled) return;

    this.value = icon;
    this.onChange(icon);
    this.onTouched();
  }

  clear() {
    if (this.disabled) return;

    this.value = null;
    this.onChange(null);
    this.onTouched();
  }
}
