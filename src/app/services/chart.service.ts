import { Injectable } from '@angular/core';
import {ChartType} from '../models/chart-models/chart-type';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private _isChartEditingMode = false;

  private _chartSelected: ChartType;

  constructor() { }

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
}
