import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPalexComponent } from './menu-palex.component';

describe('MenuPalexComponent', () => {
  let component: MenuPalexComponent;
  let fixture: ComponentFixture<MenuPalexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPalexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPalexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
