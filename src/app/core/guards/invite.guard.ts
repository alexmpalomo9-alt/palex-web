import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { InvitationService } from '../../features/invitations/services/invitation.service';

@Injectable({ providedIn: 'root' })
export class InviteGuard implements CanActivate {

  constructor(
    private invitationService: InvitationService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const token = route.params['token'];
    if (!token) return false;

    const invitation = await this.invitationService.getInvitation(token);

    if (!invitation) {
      this.router.navigate(['/']);
      return false;
    }

    return true; // dejar pasar
  }
}
