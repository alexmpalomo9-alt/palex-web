import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../../../auth/services/auth-service/auth.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-invite-page',
  imports: [SharedModule],
  templateUrl: './invite-page.component.html',
  styleUrls: ['./invite-page.component.scss'],
})
export class InvitePageComponent implements OnInit {
  token!: string;
  invitation: any | null = null;
  isLoading: boolean = true;  // Flag para manejar el estado de carga

  constructor(
    private route: ActivatedRoute,
    private invitationService: InvitationService,
    public auth: AuthService,
    private router: Router
  ) {}

async ngOnInit() {
  this.token = this.route.snapshot.paramMap.get('token')!;
  if (!this.token) {
    this.router.navigate(['/']);  // Redirige si no hay token en la URL
    return;
  }

  this.isLoading = true;
  try {
    this.invitation = await this.invitationService.getInvitation(this.token);
    if (!this.invitation) {
      this.invitation = null;  // Si no existe la invitación, muéstrala como null
      this.router.navigate(['/']);  // Redirige al home si la invitación no es válida
    }
  } catch (error) {
    console.error('Error al obtener la invitación:', error);
    this.invitation = null;  // Si hay un error al obtenerla, también la muestra como null
    this.router.navigate(['/']);  // Redirige al home en caso de error
  } finally {
    this.isLoading = false;  // Finaliza el estado de carga
  }
}

  // Navegar a la página de inicio
  goHome() {
    this.router.navigate(['/']);
  }

  // Navegar a la página de login
  goLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: { invite: this.token },
    });
  }

  // Cambiar de cuenta
  async switchAccount() {
    await this.auth.logout();
    this.goLogin();
  }

  // Aceptar invitación
  async accept() {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      return this.goLogin();  // Redirigir si el usuario no está logueado
    }

    try {
      const result = await this.invitationService.acceptInvitation(
        this.token,
        user.uid
      );
      this.router.navigate([`/restaurant/${result.restaurantId}`]);
    } catch (error) {
      console.error('Error al aceptar la invitación', error);
    }
  }
}
