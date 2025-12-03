import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode$ = new BehaviorSubject<boolean>(false);
  darkModeObservable = this.darkMode$.asObservable();

  constructor() {
    // Leer preferencia guardada en localStorage si existe
    const saved = localStorage.getItem('darkMode') === 'true';
    this.toggleDarkMode(saved);
  }

  toggleDarkMode(isDark: boolean) {
    this.darkMode$.next(isDark);

    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    localStorage.setItem('darkMode', String(isDark));
  }

  getDarkMode(): boolean {
    return this.darkMode$.value;
  }
}
