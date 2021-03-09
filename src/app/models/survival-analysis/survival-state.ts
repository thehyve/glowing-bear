/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SurvivalPoint } from './survival-point'

export class SurvivalState {
  _prob = 1
  _cumul = 0
  _remaining: number
  _timePoint = 0
  _eventOfInterest = 0
  _censoring = 0
  _cumulEvents = 0
  _cumulCensorings = 0
  constructor(remaining: number) {
    this._remaining = remaining
  }

  current(): SurvivalPoint {
    return new SurvivalPoint(
      this._prob,
      this._cumul,
      this._remaining,
      this._timePoint,
      this._cumulEvents,
      this._cumulCensorings,
      this._eventOfInterest,
      this._censoring
    )
  }
  next(timePoint: number, eventOfInterest: number, censoring: number): SurvivalPoint {

    let ponctualProb = (this._remaining - eventOfInterest) / (this._remaining)
    this._prob = ponctualProb * this._prob
    this._cumul = (this._remaining - eventOfInterest === 0) ?
      0 :
      this._cumul + eventOfInterest / (this._remaining * (this._remaining - eventOfInterest))

    this._timePoint = timePoint
    this._censoring = censoring
    this._eventOfInterest = eventOfInterest

    this._remaining = this._remaining - eventOfInterest - censoring
    this._cumulEvents = this._cumulEvents + eventOfInterest
    this._cumulCensorings = this._cumulCensorings + censoring
    let res = new SurvivalPoint(
      this._prob,
      this._cumul,
      this._remaining,
      timePoint,
      this._cumulEvents,
      this._cumulCensorings,
      eventOfInterest,
      censoring
    )

    return res
  }

}
