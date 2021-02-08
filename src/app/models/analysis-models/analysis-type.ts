/**
 * Copyright 2020  CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export class AnalysisType {

  get name(): string {
    return this._name
  }
  get implemented(): boolean {
    return this._implemented
  }
  static readonly SURVIVAL = new AnalysisType('Survival', true)
  static readonly LINEAR_REGRESSION = new AnalysisType('Linear Regression', false)
  static readonly LOGISTIC_REGRESSION = new AnalysisType('Logistic Regression', false)

  static readonly ALL_TYPES = [
    AnalysisType.SURVIVAL,
    AnalysisType.LINEAR_REGRESSION,
    AnalysisType.LOGISTIC_REGRESSION
  ]
  _name: string
  _implemented: boolean

  private constructor(name: string, implemented: boolean) {
    this._name = name
    this._implemented = implemented

  }
}
