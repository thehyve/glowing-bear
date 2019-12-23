import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbChartEditingComponent } from './gb-chart-editing.component';

describe('GbChartEditingComponent', () => {
  let component: GbChartEditingComponent;
  let fixture: ComponentFixture<GbChartEditingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbChartEditingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbChartEditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
