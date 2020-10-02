/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SurvivalPoint, ChiSquaredCdf } from './survival-curves'
import { logRank2Groups } from './log-rank-p-value'
import { NewCoxRegression, coxToString } from '../cox-regression/coxModel'

export function numericalTables(curves: SurvivalPoint[][], maxIter: number = 1000, tolerance: number = 1e-14, stringPrecision: number = 3): NumericalTablesType {
  const len = curves.length

  let groupLogrankTable = new Array<Array<string>>()
  let groupCoxRegTable = new Array<Array<string>>()
  let groupCoxWaldTable = new Array<Array<string>>()
  let groupCoxLogtestTable = new Array<Array<string>>()

  let groupTotalEvent = new Array<string>()
  let groupTotalCensoring = new Array<string>()
  let groupTotalAtRisk = new Array<string>()

  for (let i = 0; i < len; i++) {
    let logrankRow = new Array<string>()
    let coxRegRow = new Array<string>()
    let waldCoxRow = new Array<string>()
    let coxLogtestRow = new Array<string>()
    let totalAtRisk: string
    let totalEvent: string
    let totalCensoring: string
    for (let j = 0; j < len; j++) {
      let logrank = logRank2Groups(curves[i], curves[j]).toPrecision(stringPrecision)
      logrankRow.push(logrank)
      let cox = NewCoxRegression([curves[i], curves[j]], maxIter, tolerance, 'breslow').run()
      let beta = cox.finalBeta[0]
      let variance = cox.finalCovarianceMatrixEstimate[0][0]
      let coxReg = coxToString(beta, variance)
      let waldStat = Math.pow(beta, 2) / (variance + 1e-14)
      let waldTest = (1.0 - ChiSquaredCdf(waldStat, 1)).toPrecision(3)
      let likelihoodRatio = 2.0 * (cox.finalLogLikelihood - cox.initialLogLikelihood)
      let coxLogtest = (1.0 - ChiSquaredCdf(likelihoodRatio, 1)).toPrecision(3)
      console.log('loglikelihoodRatio', likelihoodRatio, 'logtest pvalue', coxLogtest)
      coxRegRow.push(coxReg)
      waldCoxRow.push(waldTest)
      coxLogtestRow.push(coxLogtest)

    }
    totalAtRisk = curves[i][0].atRisk.toString()
    totalEvent = curves[i].map(p => p.nofEvents).reduce((a, b) => a + b).toString()
    totalCensoring = curves[i].map(p => p.nofCensorings).reduce((a, b) => a + b).toString()
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
  groupLogrankTable: string[][],
  groupCoxRegTable: string[][],
  groupCoxWaldTable: string[][],
  groupCoxLogtestTable: string[][],
  groupTotalEvent: string[],
  groupTotalCensoring: string[],
  groupTotalAtRisk: string[]
}
