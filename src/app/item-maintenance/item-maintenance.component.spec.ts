import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemMaintenanceComponent } from './item-maintenance.component';

describe('ItemMaintenanceComponent', () => {
  let component: ItemMaintenanceComponent;
  let fixture: ComponentFixture<ItemMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
