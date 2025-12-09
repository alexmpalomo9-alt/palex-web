import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly key = 'darkMode';

  private darkMode$: BehaviorSubject<boolean>;
  darkModeObservable; // la inicializamos en constructor

  constructor() {
    const saved = localStorage.getItem(this.key) === 'true';
    this.darkMode$ = new BehaviorSubject<boolean>(saved);
    this.darkModeObservable = this.darkMode$.asObservable();
    document.documentElement.classList.toggle('dark-theme', saved);
  }

  /** Activa o desactiva el modo oscuro */
  setDarkMode(isDark: boolean) {
    this.darkMode$.next(isDark);
    document.documentElement.classList.toggle('dark-theme', isDark);
    localStorage.setItem(this.key, String(isDark));
  }

  /** Alterna el modo */
  toggleDarkMode() {
    const newMode = !this.darkMode$.value;
    this.setDarkMode(newMode);
  }

  /** Obtener valor actual */
  getDarkMode(): boolean {
    return this.darkMode$.value;
  }
}
