import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {Chart} from '../../../../models/chart-models/chart';
import {GbFractalisChartComponent} from './gb-fractalis-chart.component';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {MockComponent} from 'ng2-mock-component';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisServiceMock} from '../../../../services/mocks/fractalis.service.mock';
import {BehaviorSubject} from 'rxjs/Rx';
import {FractalisChart} from '../../../../models/fractalis-models/fractalis-chart';
import {FractalisDataType} from '../../../../models/fractalis-models/fractalis-data-type';
import {FractalisEtlState} from '../../../../models/fractalis-models/fractalis-etl-state';
import {FractalisData} from '../../../../models/fractalis-models/fractalis-data';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {Concept} from '../../../../models/constraint-models/concept';


function createMockConcept(code: string, type: ConceptType): Concept {
  const concept = new Concept();
  concept.type = type;
  concept.code = code;
  return concept;
}

describe('GbFractalisChartComponent', () => {
  let component: GbFractalisChartComponent;
  let fixture: ComponentFixture<GbFractalisChartComponent>;
  let fractalisService: FractalisService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbFractalisChartComponent,
        MockComponent({selector: 'gb-cross-table'})
      ],
      providers: [
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fractalisService = TestBed.inject(FractalisService);
    fixture = TestBed.createComponent(GbFractalisChartComponent);
    component = fixture.componentInstance;
  });

  it('should create a cross table chart', () => {
    component.chart = new Chart(ChartType.CROSSTABLE);
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.chartWidth).toEqual('35em');
    expect(component.chartHeight).toEqual('auto');
  });

  const mockFractalisTaskData: FractalisData[] = [
    {
      data_type: FractalisDataType.NUMERICAL,
      etl_message: '',
      etl_state: FractalisEtlState.SUCCESS,
      label: 'concept_num_1',
      task_id: 'var_1'
    },
    {
      data_type: FractalisDataType.NUMERICAL,
      etl_message: '',
      etl_state: FractalisEtlState.SUCCESS,
      label: 'concept_num_2',
      task_id: 'var_2'
    },
    {
      data_type: FractalisDataType.CATEGORICAL,
      etl_message: '',
      etl_state: FractalisEtlState.SUCCESS,
      label: 'concept_cat_1',
      task_id: 'var_3'
    }
  ];

  it('should create a box plot chart', (done) => {
    const chartSubject = new BehaviorSubject<FractalisChart>({
      type: ChartType.BOXPLOT,
      chartObject: {},
      description: {
        numVars: {
          label: 'Numerical',
          minLength: 1,
          maxLength: 1,
          value: []
        }
      }
    });
    spyOn(fractalisService, 'initChart').and.returnValue(chartSubject.asObservable());
    spyOn(fractalisService, 'getTrackedVariables').and.returnValue(Promise.resolve({
        data: {
          data_states: mockFractalisTaskData
        }
    }));
    fractalisService.selectedVariables = [createMockConcept('concept_num_1', ConceptType.NUMERICAL)];
    component.chart = new Chart(ChartType.BOXPLOT);
    fixture.detectChanges();
    expect(component).toBeTruthy();
    setTimeout(() => {
      expect(component.fractalisChart).not.toBeNull();
      done();
    }, 1000);
  });

  it('should validate parameters for a box plot chart', (done) => {
    const chartSubject = new BehaviorSubject<FractalisChart>({
      type: ChartType.BOXPLOT,
      chartObject: {},
      description: {
        numVars: {
          label: 'Numerical',
          minLength: 1,
          maxLength: 1,
          value: []
        }
      }
    });
    spyOn(fractalisService, 'initChart').and.returnValue(chartSubject.asObservable());
    spyOn(fractalisService, 'getTrackedVariables').and.returnValue(Promise.resolve({
      data: {
        data_states: mockFractalisTaskData
      }
    }));
    fractalisService.selectedVariables = [];
    component.chart = new Chart(ChartType.BOXPLOT);
    fixture.detectChanges();
    expect(component).toBeTruthy();
    setTimeout(() => {
      expect(component.fractalisChart).not.toBeNull();
      expect(fractalisService.variablesInvalid).toBeTruthy();
      expect(fractalisService.variablesValidationMessages.length).toEqual(1);
      done();
    }, 1000);
  });

});
