import {inject, TestBed} from '@angular/core/testing';

import {FractalisService} from './fractalis.service';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ConstraintService} from './constraint.service';
import {ChartType} from '../models/chart-models/chart-type';
import {Chart} from '../models/chart-models/chart';
import {AppConfig} from '../config/app.config';
import {AppConfigFractalisDisabledMock, AppConfigMock} from '../config/app.config.mock';
import {Concept} from '../models/constraint-models/concept';
import {ConceptType} from '../models/constraint-models/concept-type';
import {FractalisEtlState} from '../models/fractalis-models/fractalis-etl-state';
import {CohortService} from './cohort.service';
import {CohortServiceMock} from './mocks/cohort.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {Cohort} from '../models/cohort-models/cohort';

describe('FractalisService', () => {

  let fractalisService: FractalisService;
  let constraintService: ConstraintService;
  let resourceService: ResourceService;
  let cohortService: CohortService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        FractalisService
      ]
    });
    spyOn(window, 'setInterval').and.stub();
    fractalisService = TestBed.get(FractalisService);
    constraintService = TestBed.get(ConstraintService);
    resourceService = TestBed.get(ResourceService);
    cohortService = TestBed.get(CohortService);
  });

  it('should be injected', inject([FractalisService], (service: FractalisService) => {
    expect(service).toBeTruthy();
  }));

  it('should finish preparing cache when no variable is in submitted status', () => {
    const dataObj = {
      data: {
        data_states: [
          {
            etl_state: FractalisEtlState.SUCCESS
          },
          {
            etl_state: FractalisEtlState.SUCCESS
          },
          {
            etl_state: FractalisEtlState.FAILURE
          }
        ]
      }
    };
    spyOn(fractalisService, 'getTrackedVariables').and.returnValue(Promise.resolve(dataObj));
    fractalisService.updateVariablesStatus().then(_ => {
      expect(fractalisService.isPreparingCache).toBe(false);
    }).catch(err => {
      fail(err);
    });
  });

  it('should continue preparing cache when there is variable in submitted status', () => {
    const dataObj = {
      data: {
        data_states: [
          {
            etl_state: FractalisEtlState.SUCCESS
          },
          {
            etl_state: FractalisEtlState.SUBMITTED
          },
          {
            etl_state: FractalisEtlState.FAILURE
          }
        ]
      }
    };
    fractalisService.isPreparingCache = true;
    spyOn(fractalisService, 'getTrackedVariables').and.returnValue(Promise.resolve(dataObj));

    fractalisService.updateVariablesStatus().then(_ => {
      expect(fractalisService.isPreparingCache).toBe(true);
    }).catch(err => {
      fail(err);
    });
  });

  it('should add or recreate chart', () => {
    fractalisService.selectedChartType = ChartType.HEATMAP;
    // when there is no chart
    expect(fractalisService.charts.length).toEqual(0);
    // then new chart is added
    fractalisService.addOrRecreateChart();
    expect(fractalisService.charts.length).toEqual(1);

    // when previous chart is invalid
    fractalisService.charts[0].isValid = false;
    // then previous chart is replaced
    fractalisService.addOrRecreateChart();
    expect(fractalisService.charts.length).toEqual(1);
    expect(fractalisService.charts[0].isValid).toEqual(true);
  });

  it('should remove chart', () => {
    let chart1 = new Chart(ChartType.SCATTERPLOT);
    let chart2 = new Chart(ChartType.BOXPLOT);
    fractalisService.charts.push(chart1);
    fractalisService.charts.push(chart2);
    expect(fractalisService.charts.length).toEqual(2);
    fractalisService.removeChart(chart1);
    expect(fractalisService.charts.length).toEqual(1);
    expect(fractalisService.charts[0]).toBe(chart2);
  });

  it('should set variables invalid', () => {
    let errorMessages = ['Invalid variable'];
    fractalisService.invalidateVariables(errorMessages);
    expect(fractalisService.variablesValidationMessages).toEqual(errorMessages);
    expect(fractalisService.variablesInvalid).toEqual(true);
  });

  it('should clear validation', () => {
    let errorMessages = ['Invalid variable'];
    fractalisService.invalidateVariables(errorMessages);
    expect(fractalisService.variablesValidationMessages).toEqual(errorMessages);
    expect(fractalisService.variablesInvalid).toEqual(true);
    fractalisService.clearValidation();
    expect(fractalisService.variablesValidationMessages).toEqual([]);
    expect(fractalisService.variablesInvalid).toEqual(false);
  });

  it('should show messages for fractalis variable loading', () => {
    let c1 = new Concept();
    c1.code = 'QWERT';
    c1.type = ConceptType.CATEGORICAL;
    let c2 = new Concept();
    c2.code = 'WERTY';
    c2.type = ConceptType.NUMERICAL;
    let c3 = new Concept();
    c3.code = 'ASDFG';
    c3.type = ConceptType.HIGH_DIMENSIONAL;
    let c4 = new Concept();
    c4.code = 'ZXCVB';
    c4.type = ConceptType.DATE;
    let c5 = new Concept();
    c5.code = 'POIUY';
    c5.type = ConceptType.TEXT;
    fractalisService.setupFractalis();
    fractalisService.selectedVariablesUpdated.next([c1, c2, c3, c4, c5]);
    expect(fractalisService.isPreparingCache).toBe(true);
  });

  it('should set subsets when cohorts are changed', () => {
    fractalisService.setupFractalis();
    let spySetSubsets = spyOn(fractalisService.F, 'setSubsets').and.stub();
    let cohort1 = new Cohort('id1', 'name1');
    cohort1.selected = true;
    let cohort2 = new Cohort('id2', 'name2');
    cohort2.selected = true;
    cohortService.cohortsUpdated.asObservable()
      .subscribe(res => {
        expect(spySetSubsets).toHaveBeenCalledWith([['one', 'two', 'three'], ['one', 'two', 'three']],
          [ 'name1', 'name2' ])
      });
    cohortService.cohorts.push(cohort1);
    cohortService.cohorts.push(cohort2);
    cohortService.cohortsUpdated.next([cohort1, cohort2]);
  });

});

describe('FractalisService with analysis disabled', () => {

  let fractalisService: FractalisService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigFractalisDisabledMock
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        FractalisService
      ]
    });
    fractalisService = TestBed.get(FractalisService);
  });

  it('should be injected', inject([FractalisService], (service: FractalisService) => {
    expect(service).toBeTruthy();
  }));

  it('should disable fractalis analysis', () => {
    expect(fractalisService['F']).not.toBeTruthy();
    expect(fractalisService.isFractalisEnabled).toBe(false);
    expect(fractalisService.isPreparingCache).toBe(false);
  });


  it('should enable crosstable', () => {
    expect(fractalisService.availableChartTypes.length).toEqual(1);
    expect(fractalisService.availableChartTypes[0].label).toEqual(ChartType.CROSSTABLE);

    fractalisService.selectedChartType = ChartType.CROSSTABLE;
    expect(fractalisService.charts.length).toEqual(0);
    fractalisService.addOrRecreateChart();
    expect(fractalisService.charts.length).toEqual(1);
    expect(fractalisService.charts[0].isValid).toEqual(true);
    expect(fractalisService.charts[0].type).toEqual(ChartType.CROSSTABLE);
  });

});


