import { Injectable, NgZone } from '@angular/core';
import { AuthService } from './auth-service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionTimeoutDialogComponent } from '../components/session-timeout-dialog/session-timeout-dialog.component';

@Injectable({ providedIn: 'root' })
export class IdleService {
  private timeout?: any;
  private warningTimeout?: any;

  // Definimos tiempos en milisegundos
  private readonly MAX_IDLE_TIME: number = 60 * 1000; // 1 minuto
  private readonly WARNING_TIME: number = 10 * 1000; // 10 segundos

  private isLoggedIn: boolean = false;

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private ngZone: NgZone
  ) {
    // Escuchamos cambios en la sesión de usuario
    this.auth.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;

      if (this.isLoggedIn) {
        // Cuando el usuario se loguea, setear el tiempo de última actividad
        localStorage.setItem('lastActivity', Date.now().toString());
        this.startTimers(); // Iniciar los temporizadores
      } else {
        this.clearTimers(); // Limpiar temporizadores si no hay usuario
        localStorage.removeItem('lastActivity');
      }
    });

    // Inicializamos los eventos de actividad
    this.initializeListeners();
  }

  // --------------------------------------------------
  // Eventos de actividad del usuario
  // --------------------------------------------------
  private initializeListeners(): void {
    const events: string[] = ['mousemove', 'click', 'keydown', 'wheel', 'touchstart'];

    events.forEach((event: string) =>
      window.addEventListener(event, () => {
        if (this.isLoggedIn) {
          localStorage.setItem('lastActivity', Date.now().toString()); // Actualizamos el tiempo de actividad
        }
      })
    );
  }

  // --------------------------------------------------
  // Funciones de temporización
  // --------------------------------------------------
  private startTimers(): void {
    // Ejecutar fuera de Angular para evitar trigger innecesarios de detección de cambios
    this.ngZone.runOutsideAngular(() => {
      this.clearTimers(); // Limpiamos cualquier temporizador anterior

      const check = () => {
        const lastActivityTime: number = Number(localStorage.getItem('lastActivity') ?? '0');
        const currentTime: number = Date.now();
        const elapsedTime: number = currentTime - lastActivityTime;

        console.log('Tiempo de inactividad:', elapsedTime, 'ms');

        if (elapsedTime >= this.MAX_IDLE_TIME) {
          console.log('Cerrando sesión por inactividad');
          this.ngZone.run(() => this.auth.logout());
          return;
        }

        const remainingTime: number = this.MAX_IDLE_TIME - elapsedTime;

        // Si el tiempo restante es menor o igual al límite de advertencia, muestra el diálogo
        if (remainingTime <= this.WARNING_TIME && !this.warningTimeout) {
          this.warningTimeout = setTimeout(() => {
            this.ngZone.run(() => this.showWarning());
          }, 0);
        }

        // Rechequeo cada segundo
        this.timeout = setTimeout(check, 1000);
      };

      check(); // Llamada inicial al check
    });
  }

  private clearTimers(): void {
    console.log('Limpiando temporizadores');
    clearTimeout(this.timeout); // Limpiar temporizador principal
    clearTimeout(this.warningTimeout); // Limpiar temporizador de advertencia
    this.timeout = undefined;
    this.warningTimeout = undefined;
  }

  // --------------------------------------------------
  // Función para mostrar el diálogo de advertencia
  // --------------------------------------------------
  private showWarning(): void {
    if (!this.isLoggedIn) return;

    const dialogRef = this.dialog.open(SessionTimeoutDialogComponent, {
      width: '350px',
      disableClose: true,
      data: { seconds: this.WARNING_TIME / 1000 },
    });

    let counter: number = this.WARNING_TIME / 1000;

    const interval = setInterval(() => {
      counter--;
      dialogRef.componentInstance.data.seconds = counter;
      console.log('Tiempo restante en el diálogo:', counter);

      if (counter <= 0) {
        clearInterval(interval);
        dialogRef.close(false); // Si se termina el tiempo, cerramos sesión
      }
    }, 1000);

    // Cuando se cierra el diálogo, se gestiona si el usuario quiere continuar o no
    dialogRef.afterClosed().subscribe((continueSession: boolean) => {
      clearInterval(interval);

      if (continueSession) {
        localStorage.setItem('lastActivity', Date.now().toString());
        this.clearTimers();
        this.startTimers(); // Reiniciamos el temporizador
      } else {
        this.auth.logout(); // Si no quiere continuar, cerramos sesión
      }
    });
  }
}
