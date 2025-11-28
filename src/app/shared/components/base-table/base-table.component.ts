import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SharedModule } from '../../shared.module';
import { SearchBoxComponent } from '../search-box/search-box.component';

export interface BaseColumn {
  id: string;
  label: string;
  template?: any;
}

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [SharedModule, SearchBoxComponent],
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.css'],
})
export class BaseTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() columns: BaseColumn[] = [];
  @Input() data: any[] = [];
  @Input() filterPlaceholder?: string;
  @Input() actionsTemplate?: any;
  @Input() pageSize: number = 10;

  dataSource = new MatTableDataSource<any>([]);
  displayedIds: string[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.setupDisplayedColumns();
    this.dataSource.data = this.data || [];

    // Definir filtro para todas las columnas
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterText = filter.trim().toLowerCase();
      return this.columns.some((col) => {
        const value = data[col.id];
        return (
          value != null && value.toString().toLowerCase().includes(filterText)
        );
      });
    };
  }

  ngOnChanges() {
    this.dataSource.data = this.data;

    this.displayedIds = this.columns.map((c) => c.id);
    if (this.actionsTemplate) {
      if (!this.displayedIds.includes('actions')) {
        this.displayedIds.push('actions');
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setupDisplayedColumns() {
    this.displayedIds = this.columns.map((c) => c.id);

    if (this.actionsTemplate) {
      this.displayedIds.push('actions');
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
