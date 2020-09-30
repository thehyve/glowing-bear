/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { logLikelihood, derivative, secondDerivative } from './breslow'
import { inv } from 'mathjs'
import { inMatrix, multiplyMatrixVector, addTo } from './coxRegression'




const BreslowTestContext = {
  initialBeta: [0.0],
  initialTimePoints: [
    { time: 1, events: [{ x: [1], event: true }, { x: [0], event: true }, { x: [1], event: false }, { x: [0], event: false }] },
    { time: 2, events: [{ x: [1], event: true }, { x: [0], event: true }] },


  ]
}

export function TestBreslow(): void {
  let hessian = new Array<Array<number>>(1)
  hessian[0] = [0]
  let initLikelihood = logLikelihood(BreslowTestContext.initialTimePoints, BreslowTestContext.initialBeta)
  let initGradient = derivative(BreslowTestContext.initialTimePoints, BreslowTestContext.initialBeta)
  let initHessian = secondDerivative(BreslowTestContext.initialTimePoints, BreslowTestContext.initialBeta)
  inMatrix(hessian, initHessian)

  let likelihood = initLikelihood
  let gradient = initGradient
  let beta = BreslowTestContext.initialBeta
  console.log('breslow test', likelihood, gradient, hessian)
  for (let i = 0; i < 10; i++) {
    let delta = multiplyMatrixVector(inv(hessian), gradient)
    addTo(beta, delta)

    likelihood = logLikelihood(BreslowTestContext.initialTimePoints, beta)
    gradient = derivative(BreslowTestContext.initialTimePoints, beta)
    inMatrix(hessian, secondDerivative(BreslowTestContext.initialTimePoints, beta))





  }
}
