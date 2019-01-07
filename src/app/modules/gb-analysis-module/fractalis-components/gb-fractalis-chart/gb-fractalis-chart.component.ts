/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {AfterViewInit, Component, Input} from '@angular/core';
import {Chart} from '../../../../models/chart-models/chart';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisData} from '../../../../models/fractalis-models/fractalis-data';
import {FractalisChart} from '../../../../models/fractalis-models/fractalis-chart';
import {FractalisChartVariableMapper, ValidationError} from '../gb-fractalis-control/fractalis-chart-variable-mapper';
import {Concept} from '../../../../models/constraint-models/concept';

function convertMapToObject<T>(map: Map<string, T>): object {
  const obj = {};
  map.forEach((v, k) => { obj[k] = v });
  return obj;
}

@Component({
  selector: 'gb-fractalis-chart',
  templateUrl: './gb-fractalis-chart.component.html',
  styleUrls: ['./gb-fractalis-chart.component.css']
})
export class GbFractalisChartComponent implements AfterViewInit {

  ChartType = ChartType;

  @Input()
  chart: Chart;

  fractalisChart: FractalisChart;
  private variables: Concept[];

  constructor(private fractalisService: FractalisService) {
  }

  ngAfterViewInit() {
    this.initializeChart();
  }

  private initializeChart() {
    if (this.chart.type !== ChartType.CROSSTABLE) {
      this.variables = this.fractalisService.selectedVariables;
      this.fractalisService.initChart(this.chart.type, '#' + this.chart.id)
        .subscribe((fractalisChart: FractalisChart) => {
          this.fractalisChart = fractalisChart;
          if (!this.fractalisChart.description) {
            return;
          }
          // Check of any variables have been set
          const variablesSet = FractalisChartVariableMapper.getParameterKeys(this.fractalisChart.description)
            .some(key =>
              this.fractalisChart.description[key] !== null && this.fractalisChart.description[key].value.length > 0
            );
          if (!variablesSet) {
            this.setVariables();
          }
        }, (err) => console.error(`Failed to add a chart with id ${this.chart.id}. ${err}`)
      );
    }
    console.log(`Added a new chart with id ${this.chart.id}`);
  }

  private setVariables() {
    this.fractalisService.getLoadedVariables()
      .then(data => {
        const fractalisVariables: FractalisData[] = FractalisService.dataObjectToFractalisDataList(data);
        const mapper = new FractalisChartVariableMapper(fractalisVariables);
        mapper.mapVariables(this.fractalisChart, this.variables)
          .then(mappedVariables => {
            if (mappedVariables) {
              this.setFractalisChartParameters(mappedVariables);
            } else {
              console.warn(`No valid variable mapping`, mappedVariables);
            }
          })
          .catch((errors: ValidationError[]) => {
            console.error('Error mapping variables', errors);
            this.chart.isValid = false;
            this.fractalisService.invalidateVariables(errors.map(error => error.message));
          });
      })
      .catch(err => {
        console.error(`Failed to set variables for a chart with id ${this.chart.id}. ${err}`);
      });
  }

  private setFractalisChartParameters(mappedVariables: Map<string, string[]>) {
    if (mappedVariables !== null) {
      this.fractalisService.setChartParameters(this.fractalisChart.chartObject, convertMapToObject(mappedVariables));
    }
  }

  get chartWidth(): string {
    return this.fractalisService.chartDivSize + 'em';
  }

  get chartHeight(): string {
    let size = this.chart.type === ChartType.CROSSTABLE ? this.fractalisService.chartDivSize / 2 :
      this.fractalisService.chartDivSize;
    return size + 'em';
  }

}
