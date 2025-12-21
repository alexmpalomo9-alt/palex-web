import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../auth/services/auth-service/auth.service';
import { Observable, map, take } from 'rxjs';
import { User } from '../../users/model/user.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.authService.currentUser$.pipe(
      take(1),
      map((user) => {
        // 🔒 No autenticado → home
        if (!user) {
          return this.router.createUrlTree(['/']);
        }

        // 🎭 Roles (si aplica)
        const allowedRoles = route.data['roles'] as
          | (keyof User['globalRoles'])[]
          | undefined;

        if (!allowedRoles || allowedRoles.length === 0) {
          return true;
        }

        const userRoles = user.globalRoles || {};
        const hasRole = allowedRoles.some((r) => userRoles[r]);

        return hasRole ? true : this.router.createUrlTree(['/']);
      })
    );
  }
}
