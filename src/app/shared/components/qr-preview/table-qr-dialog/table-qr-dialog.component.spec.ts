import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableQrDialogComponent } from './table-qr-dialog.component';

describe('TableQrDialogComponent', () => {
  let component: TableQrDialogComponent;
  let fixture: ComponentFixture<TableQrDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableQrDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableQrDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
