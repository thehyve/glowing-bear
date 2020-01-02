import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbChartSettingsComponent } from './gb-chart-settings.component';

describe('GbChartEditingComponent', () => {
  let component: GbChartSettingsComponent;
  let fixture: ComponentFixture<GbChartSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbChartSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbChartSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
