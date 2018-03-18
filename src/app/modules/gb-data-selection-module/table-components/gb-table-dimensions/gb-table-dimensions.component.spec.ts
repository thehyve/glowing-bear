import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableDimensionsComponent} from './gb-table-dimensions.component';

describe('GbTableDimensionComponent', () => {
  let component: GbTableDimensionsComponent;
  let fixture: ComponentFixture<GbTableDimensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTableDimensionsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbTableDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
