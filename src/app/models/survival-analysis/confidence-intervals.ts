/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

class PointData {
  timePoint: number
  prob: number
  cumul: number
  remaining: number
}

export class ConfidenceInterval {



  private static _identity(sigma: number, point: PointData): { inf: number, sup: number } {
    let limes = point.cumul * point.prob * point.prob
    limes = Math.sqrt(limes)
    return { inf: point.prob - sigma * limes, sup: point.prob + sigma * limes }
  }

  private static _logarithm(sigma: number, point: PointData): { inf: number, sup: number } {
    let limes = point.cumul
    limes = Math.sqrt(limes)
    return { inf: point.prob * Math.exp(- sigma * limes), sup: point.prob * Math.exp(sigma * limes) }


  }

  private static _logarithmMinusLogarithm(sigma: number, point: PointData): { inf: number, sup: number } {

    let limes = (point.prob === 0 || point.prob === 1) ? 0 : point.cumul / (Math.pow(Math.log(point.prob), 2))
    limes = Math.sqrt(limes)
    return { inf: Math.pow(point.prob, Math.exp(sigma * limes)), sup: Math.pow(point.prob, Math.exp(- sigma * limes)) }


  }

  private static _arcsineSquaredRoot(sigma: number, point: PointData): { inf: number, sup: number } {
    let limes = (point.prob === 1) ? 0 : 0.25 * point.prob / (1 - point.prob) * point.cumul
    let transformed = Math.asin(Math.sqrt(point.prob))
    limes = Math.sqrt(limes)
    return { inf: Math.pow(Math.sin(transformed - sigma * limes), 2.0), sup: Math.pow(Math.sin(transformed + sigma * limes), 2.0) }
  }

  static identity(): ConfidenceInterval {
    return new ConfidenceInterval('identity', ConfidenceInterval._identity)
  }
  static logarithm(): ConfidenceInterval {
    return new ConfidenceInterval('log', ConfidenceInterval._logarithm)
  }
  static logarithmMinusLogarithm(): ConfidenceInterval {
    return new ConfidenceInterval('log minus log', ConfidenceInterval._logarithmMinusLogarithm)
  }
  static arcsineSquaredRoot(): ConfidenceInterval {
    return new ConfidenceInterval('arcsine squared root', ConfidenceInterval._arcsineSquaredRoot)
  }
  private constructor(
    readonly description: string,
    readonly callback: (sigma: number, point: PointData) => { inf: number, sup: number }
  ) { }



}
