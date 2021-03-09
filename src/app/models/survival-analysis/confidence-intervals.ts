/**
 * Copyright 2020 - 2021 CHUV
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
    let candidates = { inf: point.prob - sigma * limes, sup: point.prob + sigma * limes }
    return { inf: (candidates.inf < 0.0) ? 0.0 : candidates.inf, sup: (candidates.sup > 1.) ? 1.0 : candidates.sup }
  }

  private static _logarithm(sigma: number, point: PointData): { inf: number, sup: number } {
    let limes = point.cumul
    limes = Math.sqrt(limes)
    let candidates = { inf: point.prob * Math.exp(- sigma * limes), sup: point.prob * Math.exp(sigma * limes) }
    return { inf: (candidates.inf < 0.0) ? 0.0 : candidates.inf, sup: (candidates.sup > 1.) ? 1.0 : candidates.sup }

  }

  private static _logarithmMinusLogarithm(sigma: number, point: PointData): { inf: number, sup: number } {

    let limes = (point.prob === 0 || point.prob === 1) ? 0 : point.cumul / (Math.pow(Math.log(point.prob), 2))
    limes = Math.sqrt(limes)
    let candidates = { inf: Math.pow(point.prob, Math.exp(sigma * limes)), sup: Math.pow(point.prob, Math.exp(- sigma * limes)) }
    return { inf: (candidates.inf < 0.0) ? 0.0 : candidates.inf, sup: (candidates.sup > 1.) ? 1.0 : candidates.sup }
  }

  private static _arcsineSquaredRoot(sigma: number, point: PointData): { inf: number, sup: number } {
    let limes = (point.prob === 1) ? 0 : 0.25 * point.prob / (1 - point.prob) * point.cumul
    let transformed = Math.asin(Math.sqrt(point.prob))
    limes = Math.sqrt(limes)
    let candidates = {
      inf: Math.pow(Math.sin(transformed - sigma * limes), 2.0),
      sup: Math.pow(Math.sin(transformed + sigma * limes), 2.0)
    }
    return { inf: (candidates.inf < 0.0) ? 0.0 : candidates.inf, sup: (candidates.sup > 1.) ? 1.0 : candidates.sup }
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
