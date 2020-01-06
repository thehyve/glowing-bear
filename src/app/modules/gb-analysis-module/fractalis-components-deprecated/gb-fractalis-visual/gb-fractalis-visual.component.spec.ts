import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbFractalisVisualComponent} from './gb-fractalis-visual.component';
import {MockComponent} from 'ng2-mock-component';
import {MatIconModule} from '@angular/material';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisServiceMock} from '../../../../services/mocks/fractalis.service.mock';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {SliderModule} from 'primeng/slider';
import {FormsModule} from '@angular/forms';

describe('GbFractalisVisualComponent', () => {
  let component: GbFractalisVisualComponent;
  let fixture: ComponentFixture<GbFractalisVisualComponent>;
  let fractalisService: FractalisService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbFractalisVisualComponent,
        // MockComponent({selector: 'gb-fractalis-chart', inputs: ['chart']})
      ],
      providers: [
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
        }
      ],
      imports: [
        FormsModule,
        MatIconModule,
        SliderModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fractalisService = TestBed.get(FractalisService);
    fixture = TestBed.createComponent(GbFractalisVisualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove chart', () => {
    fractalisService.selectedChartType = ChartType.SCATTERPLOT;
    // @ts-ignore
    fractalisService.addChart();
    expect(component.charts.length).toBe(1);
    component.onRemoveChart(new Event(''), component.charts[0]);
    expect(component.charts.length).toBe(0);
  });

  it('should clear charts', () => {
    fractalisService.selectedChartType = ChartType.SURVIVALPLOT;
    // @ts-ignore
    fractalisService.addChart();
    component.onClearCharts();
    expect(component.charts.length).toBe(0);
  });
});
