/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { logRank2Groups } from './log-rank-p-value'
import { NewCoxRegression, coxToString } from '../numerical-methods/cox-model'
import { SurvivalPoint } from 'app/models/survival-analysis/survival-point'
import { ChiSquaredCdf } from '../numerical-methods/chi-squared-cdf'
import { NumericalOperation } from 'app/models/survival-analysis/numerical-models/numerical-operation'

export function numericalTables(
  curves: SurvivalPoint[][],
  maxIter: number = 1000,
  tolerance: number = 1e-14,
  stringPrecision: number = 3
): NumericalTablesType {
  const len = curves.length

  let groupLogrankTable = new Array<Array<NumericalOperation<any, string>>>()
  let groupCoxRegTable = new Array<Array<NumericalOperation<any, string>>>()
  let groupCoxWaldTable = new Array<Array<NumericalOperation<any, string>>>()
  let groupCoxLogtestTable = new Array<Array<NumericalOperation<any, string>>>()

  let groupTotalEvent = new Array<string>()
  let groupTotalCensoring = new Array<string>()
  let groupTotalAtRisk = new Array<string>()

  for (let i = 0; i < len; i++) {
    let logrankRow = new Array<NumericalOperation<any, string>>()
    let coxRegRow = new Array<NumericalOperation<any, string>>()
    let waldCoxRow = new Array<NumericalOperation<any, string>>()
    let coxLogtestRow = new Array<NumericalOperation<any, string>>()
    let totalAtRisk: string
    let totalEvent: string
    let totalCensoring: string
    for (let j = 0; j < len; j++) {
      /**
       *
       * Descriptions of wald test and loglikelihood tests used further in this function can be found at
       *
       * BUSE, A. The Likelihood Ratio, Wald, and Lagrange Multiplier Tests: An Expository Note.
       * The American Statistician, 1982, 36(3 Part 1), 153-157
       *
       */

      // ------ logrank

      let logrankCallback = (curvesArg: SurvivalPoint[][]) => {
        let res: string
        try {
          res = logRank2Groups(curvesArg[0], curvesArg[1]).toPrecision(stringPrecision)
        } catch (err) {
          return { res: null, errMessage: (err as Error).message }
        }
        return { res: res, errMessage: null }
      }
      let logrank = NumericalOperation.NewNumericalOperation([curves[i], curves[j]], logrankCallback)

      logrankRow.push(logrank)

      // ---- cox regression

      let coxCallback = (curvesArg: SurvivalPoint[][]) => {
        let cox_ = NewCoxRegression([curvesArg[0], curvesArg[1]], maxIter, tolerance, 'breslow').run()
        if ((cox_.status) && cox_.status !== '') {
          return { res: cox_, errMessage: cox_.status }
        }
        return { res: cox_, errMessage: null }
      }

      let cox = NumericalOperation.NewNumericalOperation([curves[i], curves[j]], coxCallback)

      let coxReg = cox.addChild(({ finalBeta, finalCovarianceMatrixEstimate }) => {
        return { res: coxToString(finalBeta[0], finalCovarianceMatrixEstimate[0][0]), errMessage: null }
      })

      let waldTest = cox.addChild(({ finalBeta, finalCovarianceMatrixEstimate }) => {
        let waldStat = Math.pow(finalBeta[0], 2) / (finalCovarianceMatrixEstimate[0][0] + 1e-14)
        let waldTest_ = (1.0 - ChiSquaredCdf(waldStat, 1)).toPrecision(3)
        return { res: waldTest_, errMessage: null }
      })

      let coxLogtest = cox.addChild(({ initialLogLikelihood, finalLogLikelihood }) => {
        let likelihoodRatio = 2.0 * (finalLogLikelihood - initialLogLikelihood)
        let logTest_ = (1.0 - ChiSquaredCdf(likelihoodRatio, 1)).toPrecision(3)
        return { res: logTest_, errMessage: null }
      })



      coxRegRow.push(coxReg)
      waldCoxRow.push(waldTest)
      coxLogtestRow.push(coxLogtest)

    }
    totalAtRisk = curves[i][0].atRisk.toString()
    totalEvent = curves[i].map(p => p.eventOfInterest).reduce((a, b) => a + b).toString()
    totalCensoring = curves[i].map(p => p.censoringEvent).reduce((a, b) => a + b).toString()
    groupLogrankTable.push(logrankRow)
    groupCoxRegTable.push(coxRegRow)
    groupCoxWaldTable.push(waldCoxRow)
    groupCoxLogtestTable.push(coxLogtestRow)
    groupTotalEvent.push(totalEvent)
    groupTotalCensoring.push(totalCensoring)
    groupTotalAtRisk.push(totalAtRisk)

  }

  return {
    groupLogrankTable: groupLogrankTable,
    groupCoxRegTable: groupCoxRegTable,
    groupCoxWaldTable: groupCoxWaldTable,
    groupCoxLogtestTable: groupCoxLogtestTable,
    groupTotalEvent: groupTotalEvent,
    groupTotalCensoring: groupTotalCensoring,
    groupTotalAtRisk: groupTotalAtRisk
  }
}

export interface NumericalTablesType {
  groupLogrankTable: NumericalOperation<any, string>[][],
  groupCoxRegTable: NumericalOperation<any, string>[][],
  groupCoxWaldTable: NumericalOperation<any, string>[][],
  groupCoxLogtestTable: NumericalOperation<any, string>[][],
  groupTotalEvent: string[],
  groupTotalCensoring: string[],
  groupTotalAtRisk: string[]
}
