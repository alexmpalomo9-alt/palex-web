import { Component } from '@angular/core';
import { NavbarComponent } from '../../../../core/components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-shell',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.scss',
  standalone: true,
})
export class PublicShellComponent {}
