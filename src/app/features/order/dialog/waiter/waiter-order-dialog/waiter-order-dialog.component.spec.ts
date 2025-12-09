import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterOrderDialogComponent } from './waiter-order-dialog.component';

describe('WaiterOrderDialogComponent', () => {
  let component: WaiterOrderDialogComponent;
  let fixture: ComponentFixture<WaiterOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterOrderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaiterOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
