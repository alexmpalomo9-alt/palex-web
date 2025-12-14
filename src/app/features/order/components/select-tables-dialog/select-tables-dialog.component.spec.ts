import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTablesDialogComponent } from './select-tables-dialog.component';

describe('SelectTablesDialogComponent', () => {
  let component: SelectTablesDialogComponent;
  let fixture: ComponentFixture<SelectTablesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectTablesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTablesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
