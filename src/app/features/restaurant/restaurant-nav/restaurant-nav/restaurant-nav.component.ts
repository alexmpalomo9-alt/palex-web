import { Component, Input, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-restaurant-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SharedModule],
  templateUrl: './restaurant-nav.component.html',
  styleUrls: ['./restaurant-nav.component.scss'],
})
export class RestaurantNavComponent {
  // Recibe la referencia real del sidenav desde el padre
  @Input() sidenav!: MatSidenav;

  // Indica si el dispositivo es mobile (< 1000px)
  @Input() isMobile: boolean = false;

  // Cierra con boton close el sidenav- Si se desea cerrar el sidenav solo cuando es mobile. if (this.isMobile)
  close() {
    if (this.isMobile){
    this.sidenav.close();
  }}
}
