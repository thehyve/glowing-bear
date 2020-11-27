/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 *
 * A description of functions related to survival analysis can be found at
 *
 * KAPLAN, Edward L., et MEIER, Paul. Nonparametric estimation from incomplete observations.
 * Journal of the American statistical association, 1958, 53.282 : 457-481.
 *
 *
 */

export class SurvivalPoint {
  timePoint: number
  prob: number
  cumul: number // used to compute variances
  remaining: number
  atRisk: number // at risk at instant t, it is equivalent to remaining +censorings +events
  nofEvents: number
  nofCensorings: number
  cumulEvents: number
  cumulCensorings: number
  constructor(previousProb: number,
    previousCumul: number,
    remainingTotal: number,
    timePoint: number,
    previousCumulEvents: number,
    previousCumulCensoringEvents: number,
    currentEventOfInterest: number,
    currentCensoringEvent: number) {
    let ponctualProb = (remainingTotal - currentEventOfInterest) / (remainingTotal)
    let prob = ponctualProb * previousProb
    let cumul = previousCumul + currentEventOfInterest / (remainingTotal * (remainingTotal - currentEventOfInterest))

    this.timePoint = timePoint
    this.prob = prob
    this.cumul = cumul
    this.remaining = remainingTotal - currentCensoringEvent - currentEventOfInterest
    this.atRisk = remainingTotal
    this.nofEvents = currentEventOfInterest
    this.nofCensorings = currentCensoringEvent
    this.cumulEvents = previousCumulEvents + currentEventOfInterest
    this.cumulCensorings = previousCumulCensoringEvents + currentCensoringEvent

  }
}
