import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

import { SharedModule } from '../../../shared/shared.module';
import { AddButtonComponent } from '../../../shared/components/button/add-button/add-button.component';

import { AuthService } from '../../../auth/services/auth-service/auth.service';
import { ThemeService } from '../../services/theme/theme.service';
import { LoginDialogComponent } from '../../../auth/components/login-dialog/login-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SharedModule, RouterModule, AddButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Input() sidenav?: MatSidenav;
  @Input() isMobile = false;

  isLoggedIn$: Observable<boolean>;
  isDarkMode: boolean;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    // Estado de tema
    this.isDarkMode = this.themeService.getDarkMode();

    // Estado de autenticación (reactivo)
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  toggleMenu() {
    if (this.isMobile && this.sidenav) {
      this.sidenav.toggle();
    }
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  loginDialog() {
    this.dialog.open(LoginDialogComponent, {
      disableClose: true,
    });
  }

  logOut() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}
