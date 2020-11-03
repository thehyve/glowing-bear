/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { exp, log } from 'mathjs'
import { scalarProduct, reset, addTo, multiplyByScalar, addVec, externalProduct, CoxRegression, timePoint, eventType } from './cox-regression'


/**
 * Efron can be optimized !
 */

// validate checks whether the the timepoints have the same dimension and returns this dimension, -1 otherwise
function validate(timePoints: timePoint[]): number {
  return timePoints.map(tp => tp[0].x.length).reduce((a, b) => (a === b) ? a : -1)
}

export class efronCoxRegression extends CoxRegression {

  protected logLikelihood(data: timePoint[], parameter: number[]): number {
    return logLikelihood(data, parameter)
  }
  protected gradient(data: timePoint[], parameter: number[]): number[] {
    return derivative(data, parameter)
  }
  protected hessian(data: timePoint[], parameter: number[]): number[] {
    return secondDerivative(data, parameter)
  }

}
// after validation
export function logLikelihood(timePoints: timePoint[], beta: number[]): number {
  let res = 0
  let k = 0
  let a = 0
  let b = 0
  let c = 0
  let d = 0

  let scal = 0

  for (let i = 0; i < timePoints.length; i++) {
    k = 0
    a = 0
    b = 0
    c = 0
    d = 0
    timePoints[i].events.forEach(evnt => {
      scal = scalarProduct(evnt.x, beta)
      if (evnt.event) {
        k += 1

        a += scal
        c += exp(scal)
      }

    })
    for (let j = i; j < timePoints.length; j++) {
      timePoints[j].events.forEach(evnt => {
        scal = scalarProduct(evnt.x, beta)
        b += exp(scal)

      })
    }



    for (let n = 0; n < k; n++) {
      d += log(b - n / k * c)
    }
    res += a - d
  }

  return res
}

export function derivative(timePoints: timePoint[], beta: number[]): number[] {
  let e = beta.map(x => 0.0)
  let f = beta.map(x => 0.0)
  let g = beta.map(x => 0.0)
  let h = beta.map(x => 0.0)
  let res = beta.map(x => 0.0)
  let b = 0.0
  let c = 0.0
  let k = 0


  let expo = 0

  for (let i = 0; i < timePoints.length; i++) {
    reset(e)
    reset(f)
    reset(g)
    reset(h)
    b = 0.0
    c = 0.0
    k = 0

    timePoints[i].events.forEach(evnt => {
      if (evnt.event) {
        expo = exp(scalarProduct(evnt.x, beta))
        c += expo
        addTo(h, evnt.x)
        addTo(f, multiplyByScalar(expo, evnt.x))
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
        1.0 / (b - n / k * c),
        addVec(e, multiplyByScalar(
          -n / k,
          f
        ))))
    }

    addTo(res, addVec(h, multiplyByScalar(-1.0, g)))

  }
  return res
}

export function secondDerivative(timePoints: timePoint[], beta: number[]): number[] {
  let p = new Array<number>(beta.length * beta.length)
  let q = new Array<number>(beta.length * beta.length)
  let e = new Array<number>(beta.length)
  let f = new Array<number>(beta.length)
  let u = new Array<number>(beta.length)
  let uut = new Array<number>(beta.length * beta.length)
  let res = new Array<number>(beta.length * beta.length)
  reset(uut)
  reset(res)
  let xxt = new Array<number>(beta.length * beta.length)
  reset(xxt)
  let b = 0.0
  let c = 0.0
  let k = 0
  let expo = 0.0
  let r = 0.0


  for (let i = 0; i < timePoints.length; i++) {
    reset(p)
    reset(q)
    reset(e)
    reset(f)
    reset(u)

    b = 0.0
    c = 0.0
    k = 0
    timePoints[i].events.forEach(evnt => {
      if (evnt.event) {
        expo = exp(scalarProduct(evnt.x, beta))
        externalProduct(xxt, evnt.x, multiplyByScalar(expo, evnt.x))
        addTo(q, xxt)
        c += expo
        addTo(f, multiplyByScalar(expo, evnt.x))
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
      r = b - n / k * c

      u = addVec(e, multiplyByScalar(-n / k, f))
      externalProduct(uut, u, u)

      addTo(res, multiplyByScalar(1.0 / r, addVec(p, multiplyByScalar(-n / k, q))))
      addTo(res, multiplyByScalar(-1.0 / (r * r), uut))
    }
  }
  return res
}
