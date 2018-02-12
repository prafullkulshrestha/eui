import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSearchTabViewComponent } from './item-search-tab-view.component';

describe('ItemSearchTabViewComponent', () => {
  let component: ItemSearchTabViewComponent;
  let fixture: ComponentFixture<ItemSearchTabViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSearchTabViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSearchTabViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
