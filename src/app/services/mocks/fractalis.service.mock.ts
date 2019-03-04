/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ChartType} from '../../models/chart-models/chart-type';
import {Chart} from '../../models/chart-models/chart';
import {Concept} from '../../models/constraint-models/concept';
import {BehaviorSubject, Observable} from 'rxjs/Rx';
import {FractalisChart} from '../../models/fractalis-models/fractalis-chart';
import {Subject} from 'rxjs';

export class FractalisServiceMock {

  private _charts: Chart[] = [];
  private _selectedVariables: Concept[] = [];
  private selectedVariablesUpdated = new Subject<Concept[]>();
  private _isPreparingCache = true;
  private isClearingCache = false;
  private _variablesInvalid = false;
  private _variablesValidationMessages: string[];
  private _selectedChartType: ChartType = null;
  private _availableChartTypes: ChartType[] = [
    ChartType.CROSSTABLE,
    ChartType.HEATMAP,
    ChartType.BOXPLOT,
    ChartType.HISTOGRAM,
    ChartType.PCA,
    ChartType.SCATTERPLOT,
    ChartType.SURVIVALPLOT,
    ChartType.VOLCANOPLOT
  ];
  private chartDivSize = 35;

  constructor() {
  }

  initChart(chartType: ChartType, chartId: string): Observable<FractalisChart> {
    const chartSubject = new BehaviorSubject<FractalisChart>({
      type: chartType,
      chartObject: {},
      description: null
    });
    return chartSubject.asObservable();
  }

  setChartParameters(chartObject: any, parameters: object) {
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

  public invalidateVariables(errorMessages: string[]) {
    this.variablesValidationMessages = errorMessages;
    this.variablesInvalid = true;
  }

  public clearValidation() {
    this.variablesValidationMessages = [];
    this.variablesInvalid = false;
  }

  public clearCache() {
    this.isClearingCache = false;
  }

  public getTrackedVariables(): Promise<object> {
    return new Promise(function (resolve, reject) {
      resolve({
        data: {
          data_states: []
        }
      });
    });
  }

  public setupFractalis(): Promise<any> {
    return new Promise<any>(resolve => {
      resolve(true);
    });
  }

  get previousChart(): Chart {
    return this.charts[this.charts.length - 1];
  }

  get charts(): Chart[] {
    return this._charts;
  }

  set charts(value: Chart[]) {
    this._charts = value;
  }

  get selectedVariables(): Concept[] {
    return this._selectedVariables;
  }

  set selectedVariables(value: Concept[]) {
    this._selectedVariables = value;
  }

  get isPreparingCache(): boolean {
    return this._isPreparingCache;
  }

  set isPreparingCache(value: boolean) {
    this._isPreparingCache = value;
  }

  get variablesInvalid(): boolean {
    return this._variablesInvalid;
  }

  set variablesInvalid(value: boolean) {
    this._variablesInvalid = value;
  }

  get variablesValidationMessages(): string[] {
    return this._variablesValidationMessages;
  }

  set variablesValidationMessages(value: string[]) {
    this._variablesValidationMessages = value;
  }

  get selectedChartType(): ChartType {
    return this._selectedChartType;
  }

  set selectedChartType(value: ChartType) {
    this._selectedChartType = value;
  }

  get availableChartTypes(): ChartType[] {
    return this._availableChartTypes;
  }

  set availableChartTypes(value: ChartType[]) {
    this._availableChartTypes = value;
  }

}
