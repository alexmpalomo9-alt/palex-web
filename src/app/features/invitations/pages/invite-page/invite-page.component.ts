import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-invite-page',
  imports: [SharedModule],
  templateUrl: './invite-page.component.html',
  styleUrl: './invite-page.component.scss'
})
export class InvitePageComponent implements OnInit {
  token!: string;
  invitation: any | null = null;

  constructor(
    private route: ActivatedRoute,
    private invitationService: InvitationService,
    public auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.invitation = await this.invitationService.getInvitation(this.token);

    if (!this.invitation) {
      this.invitation = null; // Mostrar texto de error
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: { invite: this.token },
    });
  }

  async switchAccount() {
    await this.auth.logout();
    this.goLogin();
  }

  async accept() {
    const user = await this.auth.getCurrentUser();
    if (!user) return this.goLogin();

    const result = await this.invitationService.acceptInvitation(
      this.token,
      user.uid
    );

    this.router.navigate([`/restaurant/${result.restaurantId}`]);
  }
}
