import { Injectable, NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionTimeoutDialogComponent } from '../components/session-timeout-dialog/session-timeout-dialog.component';

@Injectable({ providedIn: 'root' })
export class IdleService {
  private timeout!: any;
  private warningTimeout!: any;

  private readonly MAX_IDLE_TIME = 10 * 60 * 1000; // 10 minutos
  private readonly WARNING_TIME = 30 * 1000; // 30 segundos antes del logout

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private ngZone: NgZone
  ) {
    this.initializeListeners();
    this.resetTimer();
  }

  initializeListeners() {
    const events = ['mousemove', 'click', 'keydown', 'wheel', 'touchstart'];

    events.forEach((event) =>
      window.addEventListener(event, () => this.resetTimer())
    );
  }

  resetTimer() {
    // Verificar que hay sesión activa
    if (!this.auth.isLoggedIn) {
      this.clearTimers();
      return;
    }

    const now = Date.now();
    localStorage.setItem('lastActivity', now.toString());

    this.ngZone.runOutsideAngular(() => {
      this.clearTimers();

      const last = Number(localStorage.getItem('lastActivity')) || now;
      const elapsed = now - last;
      const remaining = this.MAX_IDLE_TIME - elapsed;

      if (remaining <= 0) {
        this.ngZone.run(() => this.auth.logout());
        return;
      }

      // Mostrar advertencia 30s antes
      this.warningTimeout = setTimeout(() => {
        this.ngZone.run(() => this.showWarning());
      }, remaining - this.WARNING_TIME);

      // Logout cuando se cumple el tiempo total
      this.timeout = setTimeout(() => {
        this.ngZone.run(() => this.auth.logout());
      }, remaining);
    });
  }

  private clearTimers() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = undefined;
    }
  }

  private showWarning() {
    if (!this.auth.isLoggedIn) return;

    const dialogRef = this.dialog.open(SessionTimeoutDialogComponent, {
      width: '350px',
      disableClose: true,
      data: { seconds: this.WARNING_TIME / 1000 },
    });

    let counter = this.WARNING_TIME / 1000;

    const interval = setInterval(() => {
      counter--;
      dialogRef.componentInstance.data.seconds = counter;

      if (counter <= 0) {
        clearInterval(interval);
        dialogRef.close(false);
      }
    }, 1000);

    dialogRef.afterClosed().subscribe((result) => {
      clearInterval(interval);
      if (result) {
        this.resetTimer();
      } else {
        this.auth.logout();
      }
    });
  }
}
