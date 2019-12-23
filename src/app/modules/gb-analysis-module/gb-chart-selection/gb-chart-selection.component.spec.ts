import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbChartSelectionComponent } from './gb-chart-selection.component';

describe('GbChartSelectionComponent', () => {
  let component: GbChartSelectionComponent;
  let fixture: ComponentFixture<GbChartSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbChartSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbChartSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
