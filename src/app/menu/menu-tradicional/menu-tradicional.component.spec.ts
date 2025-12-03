import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTradicionalComponent } from './menu-tradicional.component';

describe('MenuTradicionalComponent', () => {
  let component: MenuTradicionalComponent;
  let fixture: ComponentFixture<MenuTradicionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTradicionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuTradicionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
