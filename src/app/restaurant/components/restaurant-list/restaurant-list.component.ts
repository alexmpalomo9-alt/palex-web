import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { BaseTableComponent } from '../../../shared/components/base-table/base-table.component';
import { Restaurant } from '../../model/restaurant.model';

interface TableColumn {
  id: string;
  label: string;
  template?: TemplateRef<any>;
}

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [SharedModule, BaseTableComponent],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css'],
})
export class RestaurantListComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  @Input() restaurants: Restaurant[] = [];

  @Output() selectRestaurant = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Restaurant>();
  @Output() remove = new EventEmitter<Restaurant>();
  @Output() enable = new EventEmitter<Restaurant>();
  @Output() disable = new EventEmitter<Restaurant>();

  @ViewChild('tplEnabled', { static: true }) tplEnabled!: TemplateRef<any>;
  @ViewChild('tplAddress', { static: true }) tplAddress!: TemplateRef<any>;

  columns: TableColumn[] = [];

  ngAfterViewInit() {
    this.columns = [
      { id: 'name', label: 'Nombre' },
      { id: 'address', label: 'Dirección', template: this.tplAddress },
      { id: 'phone', label: 'Teléfono' },
      { id: 'enabled', label: 'Activo', template: this.tplEnabled },
    ];

    this.cdr.detectChanges();
  }

  onSelect(id: string) {
    this.selectRestaurant.emit(id);
  }
  onEdit(r: Restaurant) {
    this.edit.emit(r);
  }
  onRemove(r: Restaurant) {
    this.remove.emit(r);
  }
  onEnable(r: Restaurant) {
    this.enable.emit(r);
  }
  onDisable(r: Restaurant) {
    this.disable.emit(r);
  }
}
