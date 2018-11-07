import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Chart} from '../../../../models/chart-models/chart';
import {GbFractalisChartComponent} from './gb-fractalis-chart.component';
import {ChartType} from '../../../../models/chart-models/chart-type';

describe('GbFractalisChartComponent', () => {
  let component: GbFractalisChartComponent;
  let fixture: ComponentFixture<GbFractalisChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbFractalisChartComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbFractalisChartComponent);
    component = fixture.componentInstance;
    component.chart = new Chart(ChartType.CROSSTABLE);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
