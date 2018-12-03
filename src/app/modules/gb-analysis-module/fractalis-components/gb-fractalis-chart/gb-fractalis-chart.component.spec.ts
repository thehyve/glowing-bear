import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Chart} from '../../../../models/chart-models/chart';
import {GbFractalisChartComponent} from './gb-fractalis-chart.component';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {MockComponent} from 'ng2-mock-component';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisServiceMock} from '../../../../services/mocks/fractalis.service.mock';
import {FractalisChartDescription} from '../../../../models/fractalis-models/fractalis-chart-description';
import {FractalisData} from '../../../../models/fractalis-models/fractalis-data';
import {Concept} from '../../../../models/constraint-models/concept';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {FractalisDataType} from '../../../../models/fractalis-models/fractalis-data-type';
import {FractalisEtlState} from '../../../../models/fractalis-models/fractalis-etl-state';

describe('GbFractalisChartComponent', () => {
  let component: GbFractalisChartComponent;
  let fixture: ComponentFixture<GbFractalisChartComponent>;
  let fractalisService: FractalisService;

  beforeEach(async(() => {
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
    fractalisService = TestBed.get(FractalisService);
    fixture = TestBed.createComponent(GbFractalisChartComponent);
    component = fixture.componentInstance;
    component.chart = new Chart(ChartType.CROSSTABLE);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not try to set variables if already set', () => {
    component['fractalisChartDescription'] = new FractalisChartDescription();
    component['fractalisChartDescription'].catVars = {maxLength: 2, value: ['catVar1']};
    let spy = spyOn(component['chartValidator'], 'isNumberOfVariablesValid').and.stub();

    component.setVariablesIfValid();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not set variables if invalid', () => {
    component['fractalisChartDescription'] = new FractalisChartDescription();
    let spy = spyOn(component['chartValidator'], 'isNumberOfVariablesValid').and.returnValue(false);
    let spy1 = spyOn(fractalisService, 'setVariablesInvalid').and.stub();

    component.setVariablesIfValid();

    expect(spy1).toHaveBeenCalled();
    expect(component['chart'].isValid).toEqual(false);
  });

  it('should set variables if valid', () => {
    let variableName = 'var1';
    let chartVariable = new Concept();
    chartVariable.type = ConceptType.NUMERICAL;
    chartVariable.name = variableName;
    component['chart'].variables.push(chartVariable);
    component['fractalisChartDescription'] = new FractalisChartDescription();
    let fractalisData = new FractalisData();
    fractalisData.label = variableName;
    fractalisData.task_id = FractalisDataType.NUMERICAL;
    fractalisData.etl_message = 'loaded';
    fractalisData.etl_state = FractalisEtlState.SUCCESS;

    let spy = spyOn(component['chartValidator'], 'isNumberOfVariablesValid').and.returnValue(true);
    let spy1 = spyOn(fractalisService, 'getLoadedVariables').and.returnValue(
      (Promise.resolve({data: {state: 'SUCCESS', task_id: 123, label: variableName}})));
    let spy2 = spyOn(fractalisService, 'setVariablesInvalid').and.callThrough();
    let spy3 = spyOn<any>(component, 'setFractalisChartParameters').and.callThrough();

    component.setVariablesIfValid();

    expect(spy2).not.toHaveBeenCalled();
    let fractalisVariableIds = new Map<string, string[]>();
    fractalisVariableIds.set('numVars', [`\${\"id\":\"${variableName}\",\"filters\":{}}\$`])
    // TODO fix: expect(spy3).toHaveBeenCalledWith(fractalisVariableIds);
    expect(component['chart'].isValid).toEqual(true);
  });
});
