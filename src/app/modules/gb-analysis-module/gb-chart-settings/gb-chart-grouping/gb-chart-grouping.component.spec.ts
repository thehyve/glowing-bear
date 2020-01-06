import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbChartGroupingComponent } from './gb-chart-grouping.component';

describe('GbChartGroupingComponent', () => {
  let component: GbChartGroupingComponent;
  let fixture: ComponentFixture<GbChartGroupingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbChartGroupingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbChartGroupingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
