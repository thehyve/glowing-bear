import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  _available = AnalysisType.ALL_TYPES

  _selected: AnalysisType

  constructor() { }

  get selected(): AnalysisType {
    return this._selected
  }

  set selected(analysisType: AnalysisType) {

    this._selected = analysisType
  }

  get available(): AnalysisType[] {
    return this._available
  }

  selectSurvival() {
    this._selected = AnalysisType.SURVIVAL
  }

  selectLinearRegression() {
    this._selected = AnalysisType.LINEAR_REGRESSION
  }

  selectLogisticRegression() {
    this._selected = AnalysisType.LOGISTIC_REGRESSION
  }
}

export class AnalysisType {

  get name(): string {
    return this._name
  }
  static readonly SURVIVAL = new AnalysisType('Survival')
  static readonly LINEAR_REGRESSION = new AnalysisType('Linear Regresion')
  static readonly LOGISTIC_REGRESSION = new AnalysisType('Logistic Regression')

  static readonly ALL_TYPES = [
    AnalysisType.SURVIVAL,
    AnalysisType.LINEAR_REGRESSION,
    AnalysisType.LOGISTIC_REGRESSION
  ]
  _name: string

  private constructor(name: string) {
    this._name = name

  }
}
