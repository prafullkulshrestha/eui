import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSourceInfoComponent } from './org-source-info.component';

describe('OrgSourceInfoComponent', () => {
  let component: OrgSourceInfoComponent;
  let fixture: ComponentFixture<OrgSourceInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgSourceInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgSourceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
