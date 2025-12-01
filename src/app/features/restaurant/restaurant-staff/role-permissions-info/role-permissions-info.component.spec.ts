import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePermissionsInfoComponent } from './role-permissions-info.component';

describe('RolePermissionsInfoComponent', () => {
  let component: RolePermissionsInfoComponent;
  let fixture: ComponentFixture<RolePermissionsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePermissionsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolePermissionsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
