import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgManualMatchingComponent } from './org-manual-matching.component';

describe('OrgManualMatchingComponent', () => {
  let component: OrgManualMatchingComponent;
  let fixture: ComponentFixture<OrgManualMatchingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgManualMatchingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgManualMatchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
