import { Injectable } from '@angular/core';
import {ChartType} from '../models/chart-models/chart-type';
import {CohortService} from './cohort.service';
import {SelectItem} from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private _isChartEditingMode = false;

  private _chartSelected: ChartType;

  private _cohorts: SelectItem[];

  private _cohortsSelected: SelectItem[];

  constructor(private cohortService: CohortService) {
    this.fetchCohortDropdownElements();
  }

  fetchCohortDropdownElements() {
    this.cohorts = [];
    this.cohortService.allSavedCohorts.forEach( c => {
      this.cohorts.push({label: c.name, value: c.id})
    });
  }

  get isChartEditingMode(): boolean {
    return this._isChartEditingMode;
  }

  set isChartEditingMode(value: boolean) {
    this._isChartEditingMode = value;
  }

  get chartSelected(): ChartType {
    return this._chartSelected;
  }

  set chartSelected(value: ChartType) {
    this._chartSelected = value;
  }

  get cohorts(): SelectItem[] {
    return this._cohorts;
  }

  set cohorts(value: SelectItem[]) {
    this._cohorts = value;
  }

  get cohortsSelected(): SelectItem[] {
    return this._cohortsSelected;
  }

  set cohortsSelected(value: SelectItem[]) {
    this._cohortsSelected = value;
  }
}
