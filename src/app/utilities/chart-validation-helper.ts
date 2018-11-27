/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {FractalisChartVariable} from '../models/fractalis-models/fractalis-chart-variable';
import {Chart} from '../models/chart-models/chart';


export class ChartValidationHelper {

  private minCatVarLength: number;
  private maxCatVarLength: number;
  private minNumVarLength: number;
  private maxNumVarLength: number;

  private _errorMessage: string;

  constructor() {
    this.minCatVarLength = 0;
    this.maxCatVarLength = 0;
    this.minNumVarLength = 0;
    this.maxNumVarLength = 0;
  }

  public updateValidationCriteria(catVars: FractalisChartVariable, numVars: FractalisChartVariable) {
    if (catVars) {
      this.minCatVarLength = catVars.minLength ? catVars.minLength : 0;
      this.maxCatVarLength = catVars.maxLength ? catVars.maxLength : 0;
    }
    if (numVars) {
      this.minNumVarLength = numVars.minLength ? numVars.minLength : 0;
      this.maxNumVarLength = numVars.maxLength ? numVars.maxLength : 0;
    }
    this._errorMessage = '';
  }

  public isNumberOfVariablesValid(chart: Chart) {
    return this.checkNumberOfVariables(
      'non-numerical', chart.categoricalVariables.length, this.minCatVarLength, this.maxCatVarLength) &&
      this.checkNumberOfVariables(
        'numerical', chart.numericalVariables.length, this.minNumVarLength, this.maxNumVarLength);
  }

  private checkNumberOfVariables(typeName: string, varLength: number, minLength: number, maxLength: number): boolean {
    if (!this.isBetweenMinAndMax(varLength, minLength, maxLength)) {
      if (minLength === 0 && maxLength === 0) {
        this._errorMessage = `Specified chart type does not support ${typeName} values.`
      } else {
        this._errorMessage = `Required between ${minLength} and ${maxLength} ${typeName} values.`;
      }
      return false;
    }
    return true;
  }

  private isBetweenMinAndMax(value: number, minVal: number, maxVal: number): boolean {
    return (value <= maxVal && value >= minVal);
  }

  get errorMessage(): string {
    return this._errorMessage;
  }
}
