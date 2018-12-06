/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ChartType} from '../../models/chart-models/chart-type';
import {Chart} from '../../models/chart-models/chart';
import {Concept} from '../../models/constraint-models/concept';

export class FractalisServiceMock {
  charts: Chart[] = [];
  selectedChartType: ChartType = null;
  variablesValidationMessage: string;
  variablesInvalid: boolean;
  availableChartTypes: ChartType[] = [
    ChartType.CROSSTABLE,
    ChartType.HEATMAP,
    ChartType.BOXPLOT,
    ChartType.HISTOGRAM,
    ChartType.PCA,
    ChartType.SCATTERPLOT,
    ChartType.SURVIVALPLOT,
    ChartType.VOLCANOPLOT
  ];
  selectedVariables: Concept[] = [];
  F: any; // The fractalis object

  constructor() {
    this.F = {
      setChart: () => {}
    }
  }

  public addChart() {
    if (this.selectedChartType) {
      let chart = new Chart(this.selectedChartType);
      this.charts.push(chart);
    }
  }

  public removeChart(chart: Chart) {
    this.charts.splice(this.charts.indexOf(chart), 1);
  }

  public addOrRecreateChart() {
    if (this.previousChart && !this.previousChart.isValid) {
      this.removeChart(this.previousChart);
    }
    this.addChart();
  }

  public clearValidation() {
    this.variablesValidationMessage = '';
    this.variablesInvalid = false;
  }

  public invalidateVariables() {

  }

  public getLoadedVariables(): Promise<object> {
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  }

  get previousChart(): Chart {
    return this.charts[this.charts.length - 1];
  }

}
