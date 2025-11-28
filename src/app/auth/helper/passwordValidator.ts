import { AbstractControl } from "@angular/forms";

export function validatePassword(control: AbstractControl) {
  const value = control.value;
  const errors: any = {};

  if (!/[a-z]/.test(value)) errors.minuscula = true;
  if (!/[A-Z]/.test(value)) errors.mayuscula = true;
  if (!/[0-9]/.test(value)) errors.numero = true;
  if (value.length < 6) errors.minLength = true;

  return Object.keys(errors).length ? errors : null;
}
