import { CanActivateFn } from '@angular/router';

export const staffGuard: CanActivateFn = (route, state) => {
  return true;
};
