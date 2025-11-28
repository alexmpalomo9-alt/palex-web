import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDialogComponent } from './staff-dialog.component';

describe('StaffDialogComponent', () => {
  let component: StaffDialogComponent;
  let fixture: ComponentFixture<StaffDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaffDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
