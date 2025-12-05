import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrClientComponent } from './qr-client.component';

describe('QrClientComponent', () => {
  let component: QrClientComponent;
  let fixture: ComponentFixture<QrClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
