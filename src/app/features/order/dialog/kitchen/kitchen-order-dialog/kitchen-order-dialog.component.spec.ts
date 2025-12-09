import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenOrderDialogComponent } from './kitchen-order-dialog.component';

describe('KitchenOrderDialogComponent', () => {
  let component: KitchenOrderDialogComponent;
  let fixture: ComponentFixture<KitchenOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenOrderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
