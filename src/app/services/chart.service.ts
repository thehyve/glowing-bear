import {Injectable} from '@angular/core';
import {ChartType} from '../models/chart-models/chart-type';
import {CohortService} from './cohort.service';
import {SelectItem} from 'primeng/api';
import {CountService} from './count.service';
import {Cohort} from '../models/cohort-models/cohort';
import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';
import {VariableService} from './variable.service';
import {Concept} from '../models/constraint-models/concept';
import {Chart} from '../models/chart-models/chart';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private _isChartSelectionMode = false;
  private _currentChart: Chart;
  private _charts: Chart[] = [];
  private _cohortItems: SelectItem[];
  private _chartVariablesTree: GbTreeNode[] = [];
  private _chartDivSize: number;


  constructor(private cohortService: CohortService,
              private countService: CountService,
              private variableService: VariableService) {
    this.chartDivSize = 35;
    this.fetchCohortItems();
  }

  fetchCohortItems() {
    this.cohortItems = [];
    this.allCohorts.forEach(c => {
      this.cohortItems.push({label: c.name, value: c.id})
    });
  }

  updateSelectedCohortsCounts() {
    return new Promise((resolve, reject) => {
      return this.countService.updateAnalysisCounts(this.selectedCohortsConstraint)
        .then(() => {
          this.chartVariablesTree = this.variableService.updateChartVariablesTree();
          console.log('Tree: ' + this.chartVariablesTree);
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public createNewChart(chartType: ChartType) {
    this.currentChart = new Chart(chartType);
  }

  public addOrRecreateChart() {
    this.removePreviousChartIfInvalid();
    this.addChart();
  }

  public removePreviousChartIfInvalid() {
    if (this.previousChart && !this.previousChart.isValid) {
      this.removeChart(this.previousChart);
    }
  }

  public addChart() {
    this.charts.push(this.currentChart);
  }

  public removeChart(chart: Chart) {
    this.charts.splice(this.charts.indexOf(chart), 1);
  }

  private cohortItemsToCohorts(cohortItems: string[]): Cohort[] {
    let cohorts = [];
    cohortItems.forEach(ci => {
        cohorts.push(this.allCohorts.find(c => c.id == ci))
      }
    );
    return cohorts;
  }

  get selectedCohorts() {
    return this.cohortItemsToCohorts(this.selectedChartCohortIds);
  }

  get selectedCohortsConstraint() {
    return this.cohortService.combineCohortsConstraint(this.selectedCohorts);
  }

  get isChartSelectionMode(): boolean {
    return this._isChartSelectionMode;
  }

  set isChartSelectionMode(value: boolean) {
    this._isChartSelectionMode = value;
  }

  get currentChart(): Chart {
    return this._currentChart;
  }

  set currentChart(value: Chart) {
    this._currentChart = value;
  }

  get previousChart(): Chart {
    return this.charts[this.charts.length - 1];
  }

  get cohortItems(): SelectItem[] {
    return this._cohortItems;
  }

  set cohortItems(value: SelectItem[]) {
    this._cohortItems = value;
  }

  get selectedChartCohortIds(): string[] {
    return this.currentChart ? this.currentChart.cohortIds : null;
  }

  get selectedChartType(): ChartType {
    return this.currentChart ? this.currentChart.type : null;
  }

  get chartVariablesTree(): GbTreeNode[] {
    return this._chartVariablesTree;
  }

  set chartVariablesTree(value: GbTreeNode[]) {
    this._chartVariablesTree = value;
  }

  get chartNumericVariables(): Concept[] {
    return this.currentChart ? this.currentChart.numericVariables: [];
  }

  get allCohorts(): Cohort[] {
    return this.cohortService.allSavedCohorts;
  }

  get charts(): Chart[] {
    return this._charts;
  }

  set charts(value: Chart[]) {
    this._charts = value;
  }

  get chartDivSize(): number {
    return this._chartDivSize;
  }

  set chartDivSize(value: number) {
    this._chartDivSize = value;
  }
}
