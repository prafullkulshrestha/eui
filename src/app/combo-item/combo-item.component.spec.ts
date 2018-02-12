import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboComponentItemComponent } from './combo-component-item.component';

describe('ComboComponentItemComponent', () => {
  let component: ComboComponentItemComponent;
  let fixture: ComponentFixture<ComboComponentItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboComponentItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboComponentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
