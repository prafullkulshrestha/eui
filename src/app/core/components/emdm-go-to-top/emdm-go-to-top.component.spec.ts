import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmdmGoToTopComponent } from './emdm-go-to-top.component';

describe('EmdmGoToTopComponent', () => {
  let component: EmdmGoToTopComponent;
  let fixture: ComponentFixture<EmdmGoToTopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmdmGoToTopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmdmGoToTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
