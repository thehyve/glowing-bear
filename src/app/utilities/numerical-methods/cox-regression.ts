/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inv, det } from 'mathjs';
import { ErrorHelper } from '../error-helper';
import { MessageHelper } from '../message-helper';



export interface EventType { x: number[], event: boolean }
export interface TimePoint { time: number, events: EventType[] }
export abstract class CoxRegression {
  protected maxIter: number;
  protected initialParameter: number[];
  protected tolerance: number;
  protected data: TimePoint[];
  public constructor(data, maxIter, tolerance) {
    if (data.length === 0) {
      throw ErrorHelper.handleNewError('Number of observation is 0, this exception should be treated before.')
    }
    this.data = data
    this.maxIter = maxIter
    this.tolerance = tolerance
    this.initialParameter = new Array<number>()

    for (let i = 0; i < this.data[0].events[0].x.length; i++) {
      this.initialParameter.push(0.0)
    }

  }
  protected abstract logLikelihood(data: TimePoint[], parameter: number[]): number;
  protected abstract gradient(data: TimePoint[], parameter: number[]): number[];
  protected abstract hessian(data: TimePoint[], parameter: number[]): number[];
  public run(): {
    initialLogLikelihood: number,
    finalLogLikelihood: number,
    finalBeta: number[],
    finalCovarianceMatrixEstimate: number[][],
    status: string,
  } {
    let beta = this.initialParameter.map(x => x)

    let initialLogLikelihood = this.logLikelihood(this.data, beta)
    let lLikelihood = this.logLikelihood(this.data, beta)
    let previouslogLikelihood = initialLogLikelihood

    let hessian = new Array<Array<number>>(beta.length)
    let gradient = new Array<number>(beta.length)
    for (let i = 0; i < beta.length; i++) {
      gradient[i] = 0.0
      hessian[i] = new Array<number>(beta.length)
      for (let j = 0; j < beta.length; j++) {
        hessian[i][j] = 0.0;
      }

    }

    let finalCovarianceMatrixEstimate: number[][]

    // default status to set if the iteration number exceeds the limit without reaching tolerance

    let status = `Finished before reaching the convergence criterion (i. e. a relative ` +
      `logLikekilhood difference below ${this.tolerance}) after ${this.maxIter} iterations. ` +
      `This happens when all events of interest of a group occur after the latest event of interest of another group.`


    // do a dry run to detect non-invertible hessian matrix

    inMatrix(hessian, this.hessian(this.data, beta))
    if (det(hessian) === 0) {
      status = 'The determinant of the hessian matrix is zero. The inverse of this hessian is used for Newton-Raphson method inside numerical methods. ' +
        'It happens when no event of interest has occured within the time limit defined by the user. In the survival graphs, this is related to a constant line.'
      return {
        initialLogLikelihood: initialLogLikelihood,
        finalLogLikelihood: lLikelihood,
        finalBeta: beta,
        finalCovarianceMatrixEstimate: hessian,
        status: status,
      }
    }


    // the numerical method
    try {

      for (let i = 0; i < this.maxIter; i++) {

        gradient = this.gradient(this.data, beta)
        inMatrix(hessian, this.hessian(this.data, beta))

        let delta = multiplyMatrixVector(inv(hessian), gradient)
        addTo(beta, delta)
        lLikelihood = this.logLikelihood(this.data, beta)
        if (((previouslogLikelihood - lLikelihood) / lLikelihood) < this.tolerance) {
          status = ''
          break
        }
        previouslogLikelihood = lLikelihood


      }
      inMatrix(hessian, this.hessian(this.data, beta))
      finalCovarianceMatrixEstimate = inv(hessian)

    } catch (err) {
      status = 'Unexpected error: ' + (err as Error).message
      MessageHelper.alert('error', 'Unexpected error: ' + (err as Error).message)
      console.error((err as Error).stack)
    }
    return {
      initialLogLikelihood: initialLogLikelihood,
      finalLogLikelihood: lLikelihood,
      finalBeta: beta,
      finalCovarianceMatrixEstimate: finalCovarianceMatrixEstimate,
      status: status,
    }
  }

}


export function scalarProduct(x: number[], y: number[]): number {
  let res = x[0] * y[0]
  for (let i = 1; i < x.length; i++) {
    res += x[i] * y[i];

  }
  return res
}

export function addVec(x: number[], y: number[]): number[] {
  let res = new Array<number>(x.length)
  for (let i = 0; i < x.length; i++) {
    res[i] = x[i] + y[i];

  }
  return res
}

export function multiplyByScalar(alpha: number, x: number[]): number[] {
  return x.map(y => alpha * y)

}

export function reset(x: number[]) {
  for (let i = 0; i < x.length; i++) {
    x[i] = 0

  }
}

export function addTo(x: number[], y: number[]) {
  for (let i = 0; i < x.length; i++) {
    x[i] += y[i]

  }
}

export function externalProduct(res: number[], x: number[], y: number[]) {

  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < y.length; j++) {
      res[i * y.length + j] = x[i] * y[j]

    }

  }

}

export function inMatrix(target: number[][], flatVector: number[]) {

  for (let i = 0; i < target.length; i++) {
    for (let j = 0; j < target[i].length; j++) {
      target[i][j] = flatVector[i * target[i].length + j]

    }

  }

}
export function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  let res = new Array<number>(matrix.length)

  for (let i = 0; i < matrix.length; i++) {
    res[i] = 0
    for (let j = 0; j < vector.length; j++) {
      res[i] += matrix[i][j] * vector[j]

    }

  }

  return res
}
