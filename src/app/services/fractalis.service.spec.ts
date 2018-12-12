import {inject, TestBed} from '@angular/core/testing';

import {FractalisService} from './fractalis.service';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ConstraintService} from './constraint.service';
import {ChartType} from '../models/chart-models/chart-type';
import {Chart} from '../models/chart-models/chart';
import {AppConfig} from '../config/app.config';
import {AppConfigMock} from '../config/app.config.mock';

describe('FractalisService', () => {

  let fractalisService: FractalisService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        FractalisService
      ]
    });
    fractalisService = TestBed.get(FractalisService);
  });

  it('should be injected', inject([FractalisService], (service: FractalisService) => {
    expect(service).toBeTruthy();
  }));

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
    fractalisService.charts .push(chart1);
    fractalisService.charts .push(chart2);
    expect(fractalisService.charts.length).toEqual(2);
    fractalisService.removeChart(chart1);
    expect(fractalisService.charts.length).toEqual(1);
    expect(fractalisService.charts[0]).toBe(chart2);
  });

  it('should set variables invalid', () => {
    let errorMessage = 'Invalid variable';
    fractalisService.invalidateVariables(errorMessage);
    expect(fractalisService.variablesValidationMessage).toEqual(errorMessage);
    expect(fractalisService.variablesInvalid).toEqual(true);
  });

  it('should clear validation', () => {
    this.variablesValidationMessage = 'Some error message';
    this.variablesInvalid = true;
    fractalisService.clearValidation();
    expect(fractalisService.variablesValidationMessage).toEqual('');
    expect(fractalisService.variablesInvalid).toEqual(false);
  });

});
