import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../../../auth/components/login-dialog/login-dialog.component';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../users/model/user.model';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isLoggedIn$!: Observable<boolean>;
  currentUser: User | null = null; // permite null para evitar errores
  isDarkMode: boolean;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.isDarkMode = this.themeService.getDarkMode();
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user; // puede ser null
    });
  }

  logOut() {
    this.authService
      .logout()
      .then(() => this.router.navigate(['/']))
      .catch((error) => console.log(error));
  }

  loginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      data: { email: '', password: '' },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Se puede manejar algo después de cerrar el diálogo
    });
  }

toggleDarkMode(isDark: boolean) {
  this.isDarkMode = isDark;          // Actualiza estado local
  this.themeService.toggleDarkMode(isDark); // Llama al servicio global
}
  
}
