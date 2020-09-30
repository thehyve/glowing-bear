/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SurvivalAnalysisClear } from './survival-analysis-clear';

import * as jstat from 'jstat'

export class SurvivalCurve {

  curves: Array<{
    groupId: string
    points: Array<SurvivalPoint>
  }>

}

export class SurvivalPoint {
  timePoint: number
  prob: number
  cumul: number
  remaining: number
  atRisk: number // at risk at instant t, it is equivalent to remaining +censorings +events
  nofEvents: number
  nofCensorings: number
  cumulEvents: number
  cumulCensorings: number
}

export function ChiSquaredCdf(value: number, degreesOfFreedom: number): number {
  return jstat.chisquare.cdf(value, degreesOfFreedom)
}

export function clearResultsToArray(clearRes: SurvivalAnalysisClear): SurvivalCurve {

  let curves = clearRes.results.map(result => {
    let sortedByTimePoint = result.groupResults.sort((a, b) => {
      return a.timepoint < b.timepoint ? -1 : 1;
    })

    let survivalState = new SurvivalState(result.initialCount)
    let points = sortedByTimePoint.map(oneTimePointRes => survivalState.next(oneTimePointRes.timepoint, oneTimePointRes.events.eventOfInterest, oneTimePointRes.events.censoringEvent))
    return {
      groupId: result.groupId,
      points: points
    }
  })

  let srva = new SurvivalCurve
  srva.curves = curves
  return srva

}

export function survivalPoints(previousProb: number, previousCumul: number, remainingTotal: number, timePoint: number, previousCumulEvents: number, previousCumulCensoringEvents: number, currentEventOfInterest: number, currentCensoringEvent: number): SurvivalPoint {
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

export function retrieveGroupIds(clearRes: SurvivalAnalysisClear): Array<string> {
  return clearRes.results.map(res => res.groupId)

}



