import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../users/model/user.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const isLoggedIn = this.authService.isLoggedIn$;

    if (!isLoggedIn) {
      return this.router.createUrlTree(['/auth/login']);
    }

    // user logueado
    const user = await this.authService.getCurrentUser();
    if (!user) return this.router.createUrlTree(['/auth/login']);

    // roles permitidos definidos en la ruta
    const allowedRoles = route.data['roles'] as
      | (keyof User['globalRoles'])[]
      | undefined;

    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // no se requiere rol
    }

    // Obtenemos los roles globales del usuario
    const userRolesObj = user.globalRoles || {};

    // Verificamos si el usuario tiene alguno de los roles permitidos
    const userHasValidRole = allowedRoles.some(
      (role: keyof typeof userRolesObj) => userRolesObj[role] === true
    );

    if (!userHasValidRole) {
      return this.router.createUrlTree(['/']);
    }

    return true;
  }
}
