import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Product } from '../../model/product.model';
import { SharedModule } from '../../../shared/shared.module';
import { BaseTableComponent } from '../../../shared/components/base-table/base-table.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [SharedModule, BaseTableComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements AfterViewInit {
  
  /** Inputs */
  @Input() products: Product[] = [];
  @Input() restaurantId!: string;

  /** Outputs */
  @Output() edit = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<Product>();
  @Output() enable = new EventEmitter<Product>();
  @Output() disable = new EventEmitter<Product>();
  @Output() create = new EventEmitter<void>();

  /** Templates */
  @ViewChild('tplAvailable', { static: true }) tplAvailable: any;
  @ViewChild('tplOffer', { static: true }) tplOffer: any;
  @ViewChild('actions', { static: true }) actions: any;

  /** Columns dinámicas */
  columns: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.columns = [
      { id: 'name', label: 'Nombre' },
      { id: 'price', label: 'Precio Regular' },
      { id: 'isOffer', label: 'Oferta', template: this.tplOffer },
      { id: 'offerPrice', label: 'Precio Oferta' },
      { id: 'category', label: 'Categoría' },
      { id: 'available', label: 'Disponible', template: this.tplAvailable },
    ];

    this.cdr.detectChanges();
  }

  /** Eventos */
  onEdit(product: Product) {
    this.edit.emit(product);
  }

  onRemove(product: Product) {
    this.remove.emit(product);
  }

  onEnable(product: Product) {
    this.enable.emit(product);
  }

  onDisable(product: Product) {
    this.disable.emit(product);
  }

  onCreate() {
    this.create.emit();
  }
}
