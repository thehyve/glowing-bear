import { Injectable } from '@angular/core';
import { AnalysisType } from 'app/models/analysis-models/analysis-type';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  _available = AnalysisType.ALL_TYPES

  _selected: AnalysisType

  _analysisTypeExpanded = true

  _survivalSettingsExpanded = false

  _survivalSubGroupExpanded = false

  constructor() { }

  get available(): AnalysisType[] {
    return this._available
  }

  get selected(): AnalysisType {
    return this._selected
  }

  set selected(analysisType: AnalysisType) {

    this._selected = analysisType
  }

  get analysisTypeExpanded(): boolean {
    return this._analysisTypeExpanded
  }

  set analysisTypeExpanded(val: boolean) {
    this._analysisTypeExpanded = val
  }

  get survivalSettingsExpanded(): boolean {
    return this._survivalSettingsExpanded
  }

  set survivalSettingsExpanded(val: boolean) {
    this._survivalSettingsExpanded = val
  }

  get survivalSubGroupExpanded(): boolean {
    return this._survivalSubGroupExpanded
  }

  set survivalSubGroupExpanded(val: boolean) {
    this._survivalSubGroupExpanded = val
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
