import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbChartVariablesComponent } from './gb-chart-variables.component';

describe('GbChartVariablesComponent', () => {
  let component: GbChartVariablesComponent;
  let fixture: ComponentFixture<GbChartVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbChartVariablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbChartVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
