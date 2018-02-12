import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualMatchingComponent } from './manual-matching.component';

describe('ManualMatchingComponent', () => {
  let component: ManualMatchingComponent;
  let fixture: ComponentFixture<ManualMatchingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualMatchingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualMatchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
