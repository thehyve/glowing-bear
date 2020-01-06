import {Injectable} from '@angular/core';
import {ChartType} from '../models/chart-models/chart-type';
import {CohortService} from './cohort.service';
import {SelectItem} from 'primeng/api';
import {CountService} from './count.service';
import {Cohort} from '../models/cohort-models/cohort';
import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';
import {VariableService} from './variable.service';
import {Concept} from '../models/constraint-models/concept';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private _isChartSelectionMode = false;

  private _chartSelected: ChartType;

  private _cohortItems: SelectItem[];

  private _selectedCohortIds: string[];

  private _chartVariablesTree: GbTreeNode[] = [];

  private _chartNumericVariables: Concept[] = [];


  constructor(private cohortService: CohortService,
              private countService: CountService,
              private variableService: VariableService) {
    this.fetchCohortItems();
  }

  fetchCohortItems() {
    this.cohortItems = [];
    this.allCohorts.forEach( c => {
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

  private cohortItemsToCohorts(cohortItems: string[]): Cohort[] {
    let cohorts = [];
    cohortItems.forEach(ci => {
        cohorts.push(this.allCohorts.find(c => c.id == ci))
      }
    );
    return cohorts;
  }

  get selectedCohortsConstraint() {
    let selectedCohorts = this.cohortItemsToCohorts(this.selectedCohortIds);
    return this.cohortService.combineCohortsConstraint(selectedCohorts);
  }

  get isChartSelectionMode(): boolean {
    return this._isChartSelectionMode;
  }

  set isChartSelectionMode(value: boolean) {
    this._isChartSelectionMode = value;
  }

  get chartSelected(): ChartType {
    return this._chartSelected;
  }

  set chartSelected(value: ChartType) {
    this._chartSelected = value;
  }

  get cohortItems(): SelectItem[] {
    return this._cohortItems;
  }

  set cohortItems(value: SelectItem[]) {
    this._cohortItems = value;
  }

  get selectedCohortIds(): string[] {
    return this._selectedCohortIds;
  }

  set selectedCohortIds(value: string []) {
    this._selectedCohortIds = value;
  }

  get chartVariablesTree(): GbTreeNode[] {
    return this._chartVariablesTree;
  }

  set chartVariablesTree(value: GbTreeNode[]) {
    this._chartVariablesTree = value;
  }

  get chartNumericVariables(): Concept[] {
    return this._chartNumericVariables;
  }

  set chartNumericVariables(value: Concept[]) {
    this._chartNumericVariables = value;
  }

  get allCohorts(): Cohort[] {
    return this.cohortService.allSavedCohorts;
  }
}
