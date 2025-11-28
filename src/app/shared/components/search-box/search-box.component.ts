import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css'],
  standalone: true,
  imports: [SharedModule],
})
export class SearchBoxComponent {
  @Input() placeholder: string = 'Buscar';
  @Output() search = new EventEmitter<string>();

  onKeyUp(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }
}
