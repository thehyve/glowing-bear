/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { exp, log } from 'mathjs'
import { TimePoint, scalarProduct, reset, addTo, multiplyByScalar, addVec, externalProduct, EventType, CoxRegression } from './cox-regression'
import {SurvivalPoint} from '../../models/survival-analysis/survival-point';


/**
 * Breslow
 *
 * A description of the function implemented here can be found at
 *
 * BRESLOW, Norman E. Analysis of survival data under the proportional hazards model.
 * International Statistical Review/Revue Internationale de Statistique, 1975, p. 45-57
 *
 */


export class BreslowCoxRegression extends CoxRegression {
  protected logLikelihood(data: TimePoint[], parameter: number[]): number {
    return logLikelihood(data, parameter)
  }
  protected gradient(data: TimePoint[], parameter: number[]): number[] {
    return derivative(data, parameter)
  }
  protected hessian(data: TimePoint[], parameter: number[]): number[] {
    return secondDerivative(data, parameter)
  }

}


// after validation
export function logLikelihood(timePoints: TimePoint[], beta: number[]): number {
  let res = 0
  let k = 0
  let a = 0
  let b = 0

  let d = 0

  let scal = 0

  for (let i = 0; i < timePoints.length; i++) {
    k = 0
    a = 0
    b = 0

    d = 0
    timePoints[i].events.forEach(evnt => {
      scal = scalarProduct(evnt.x, beta)
      if (evnt.event) {
        k += 1

        a += scal
      }

    })
    for (let j = i; j < timePoints.length; j++) {
      timePoints[j].events.forEach(evnt => {
        scal = scalarProduct(evnt.x, beta)
        b += exp(scal)

      })
    }



    for (let n = 0; n < k; n++) {
      d += log(b)
    }
    res += a - d
  }

  return res
}

export function derivative(timePoints: TimePoint[], beta: number[]): number[] {
  let e = beta.map(x => 0.0)
  let g = beta.map(x => 0.0)
  let h = beta.map(x => 0.0)
  let res = beta.map(x => 0.0)
  let b = 0.0

  let k = 0


  let expo = 0
  let currentTime = 0
  for (let i = 0; i < timePoints.length; i++) {
    reset(e)
    reset(g)
    reset(h)
    b = 0.0
    k = 0

    timePoints[i].events.forEach(evnt => {
      if (evnt.event) {
        expo = exp(scalarProduct(evnt.x, beta))

        addTo(h, evnt.x)

        k += 1
      }
    })

    for (let j = i; j < timePoints.length; j++) {
      timePoints[j].events.forEach(evnt => {

        expo = exp(scalarProduct(evnt.x, beta))
        b += expo
        addTo(e, multiplyByScalar(expo, evnt.x))

      })
    }

    for (let n = 0; n < k; n++) {
      addTo(g, multiplyByScalar(
        1.0 / (b),
        e))
    }

    addTo(res, addVec(h, multiplyByScalar(-1.0, g)))

  }
  return res
}

export function secondDerivative(timePoints: TimePoint[], beta: number[]): number[] {
  let p = new Array<number>(beta.length * beta.length)
  let e = new Array<number>(beta.length)
  let u = new Array<number>(beta.length)
  let uut = new Array<number>(beta.length * beta.length)
  let res = new Array<number>(beta.length * beta.length)
  reset(uut)
  reset(res)
  let xxt = new Array<number>(beta.length * beta.length)
  reset(xxt)
  let b = 0.0
  let k = 0
  let expo = 0.0
  let r = 0.0

  for (let i = 0; i < timePoints.length; i++) {
    reset(p)
    reset(e)
    reset(u)

    b = 0.0
    k = 0
    timePoints[i].events.forEach(evnt => {
      if (evnt.event) {
        expo = exp(scalarProduct(evnt.x, beta))
        externalProduct(xxt, evnt.x, multiplyByScalar(expo, evnt.x))
        k += 1
      }
    })

    for (let j = i; j < timePoints.length; j++) {
      timePoints[j].events.forEach(evnt => {

        expo = exp(scalarProduct(evnt.x, beta))
        externalProduct(xxt, evnt.x, multiplyByScalar(expo, evnt.x))
        addTo(p, xxt)
        b += expo
        addTo(e, multiplyByScalar(expo, evnt.x))

      })
    }
    for (let n = 0; n < k; n++) {
      r = b


      externalProduct(uut, e, e)


      addTo(res, multiplyByScalar(1.0 / r, p))
      addTo(res, multiplyByScalar(-1.0 / (r * r), uut))
    }
  }
  return res
}

export function prepareEfron(survivalPointsClass0: SurvivalPoint[], survivalPointsClass1: SurvivalPoint[]): TimePoint[] {

  let tmpArray = survivalPointsClass0.map(spoint => {
    return { time: spoint.timePoint, class: 0, events: spoint.nofEvents, censorings: spoint.nofCensorings }
  })
    .concat(
      survivalPointsClass1.map(spoint => {
        return { time: spoint.timePoint, class: 1, events: spoint.nofEvents, censorings: spoint.nofCensorings }
      }))


  let tmpMap = new Map<number, EventType[]>()
  tmpArray.forEach(spoint => {
    let events = new Array<EventType>()

    for (let i = 0; i < spoint.events; i++) {
      events.push({ x: [spoint.class], event: true })

    }
    for (let i = 0; i < spoint.censorings; i++) {
      events.push({ x: [spoint.class], event: false })

    }
    if (tmpMap.has(spoint.time)) {
      tmpMap.set(spoint.time, tmpMap.get(spoint.time).concat(events))

    } else {
      tmpMap.set(spoint.time, events)
    }
  })
  let groupedTmpArray = new Array<TimePoint>()
  tmpMap.forEach((value, key) => {
    groupedTmpArray.push({ time: key, events: value })
  })

  return groupedTmpArray.sort((a, b) => a.time - b.time)
}
