import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-order-notes',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-notes.component.html',
  styleUrls: ['./order-notes.component.scss'],
})
export class OrderNotesComponent {
  @Input() notes: string = '';
  @Input() loading = false;

  @Output() notesChange = new EventEmitter<string>();

  updateNotes(value: string) {
    this.notes = value;
    this.notesChange.emit(value);
  }
}
