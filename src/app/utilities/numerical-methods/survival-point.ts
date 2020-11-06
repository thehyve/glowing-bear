/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SurvivalPoint } from 'app/models/survival-analysis/survival-point'

export function survivalPoints(
  previousProb: number,
  previousCumul: number,
  remainingTotal: number,
  timePoint: number,
  previousCumulEvents: number,
  previousCumulCensoringEvents: number,
  currentEventOfInterest: number,
  currentCensoringEvent: number
): SurvivalPoint {
  let ponctualProb = (remainingTotal - currentEventOfInterest) / (remainingTotal)
  let prob = ponctualProb * previousProb
  let cumul = previousCumul + currentEventOfInterest / (remainingTotal * (remainingTotal - currentEventOfInterest))
  return {
    timePoint: timePoint,
    prob: prob,
    cumul: cumul,
    remaining: remainingTotal - currentCensoringEvent - currentEventOfInterest,
    atRisk: remainingTotal,
    nofEvents: currentEventOfInterest,
    nofCensorings: currentCensoringEvent,
    cumulEvents: previousCumulEvents + currentEventOfInterest,
    cumulCensorings: previousCumulCensoringEvents + currentCensoringEvent

  }

}
