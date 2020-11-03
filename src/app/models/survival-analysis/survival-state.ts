/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { survivalPoints } from "app/utilities/numerical-methods/survival-point"
import { SurvivalPoint } from "./survival-point"

export class SurvivalState {
  _prob = 1
  _cumul = 0
  _remaining: number
  _cumulEvents = 0
  _cumulCensorings = 0
  constructor(remaining: number) {
    this._remaining = remaining
  }
  next(timePoint: number, eventOfInterest: number, censoring: number): SurvivalPoint {
    let res = survivalPoints(this._prob, this._cumul, this._remaining, timePoint, this._cumulEvents, this._cumulCensorings, eventOfInterest, censoring)
    this._prob = res.prob
    this._cumul = res.cumul
    this._remaining = res.remaining
    this._cumulEvents = res.cumulEvents
    this._cumulCensorings = res.cumulCensorings

    return res
  }

}