import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-add-button',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.scss'],
})
export class AddButtonComponent implements OnInit {
  @Input() label: string = 'Agregar'; // Texto del botón
  @Input() icon: string = 'add';      // Icono dinámico
  @Output() onClick = new EventEmitter<void>();

  isDarkMode: boolean = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.darkModeObservable.subscribe((value) => {
      this.isDarkMode = value;
    });
  }
}
