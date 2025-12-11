import { Injectable } from '@angular/core';
import { fromEvent, map, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScreenService {
  isMobile$ = fromEvent(window, 'resize').pipe(
    map(() => window.innerWidth <= 768),
    startWith(window.innerWidth <= 768)
  );
}
