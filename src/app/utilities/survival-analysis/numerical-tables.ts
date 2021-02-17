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
import { NumericalOperation } from 'app/models/numerical-models/numerical-operation'

export function numericalTables(
  curves: SurvivalPoint[][],
  maxIter: number = 1000,
  tolerance: number = 1e-14,
  stringPrecision: number = 3
): NumericalTablesType {
  const len = curves.length

  let groupLogrankTable = new Array<Array<NumericalOperation<SurvivalPoint[][],string>>>()
  let groupCoxRegTable = new Array<Array<NumericalOperation<SurvivalPoint[][],string>>>()
  let groupCoxWaldTable = new Array<Array<NumericalOperation<SurvivalPoint[][],string>>>()
  let groupCoxLogtestTable = new Array<Array<NumericalOperation<SurvivalPoint[][],string>>>()

  let groupTotalEvent = new Array<string>()
  let groupTotalCensoring = new Array<string>()
  let groupTotalAtRisk = new Array<string>()

  for (let i = 0; i < len; i++) {
    let logrankRow = new Array<NumericalOperation<SurvivalPoint[][],string>>()
    let coxRegRow = new Array<NumericalOperation<SurvivalPoint[][],string>>()
    let waldCoxRow = new Array<NumericalOperation<SurvivalPoint[][],string>>()
    let coxLogtestRow = new Array<NumericalOperation<SurvivalPoint[][],string>>()
    let totalAtRisk: string
    let totalEvent: string
    let totalCensoring: string
    for (let j = 0; j < len; j++) {
      
      // ------ logrank

      let logrankCallback = (curvesArg:SurvivalPoint[][])=>{
        let res : string
        try{
          res=logRank2Groups(curvesArg[i], curvesArg[j]).toPrecision(stringPrecision)
        }catch(err){
          console.warn('y a une erreur')
          return { res: null, errMessage: 'y a une erreur' }
        }
        return { res: res, errMessage: null}
      }
      let logrank = NumericalOperation.NewNumericalOperation<SurvivalPoint[][],string>([curves[i], curves[j]],logrankCallback)

      logrankRow.push(logrank)

      // ---- cox regression
      


      let cox = NewCoxRegression([curves[i], curves[j]], maxIter, tolerance, 'breslow').run()
      let beta = cox.finalBeta[0]
      let variance = cox.finalCovarianceMatrixEstimate[0][0]
      let coxReg = coxToString(beta, variance)
      let waldStat = Math.pow(beta, 2) / (variance + 1e-14)
      let waldTest = (1.0 - ChiSquaredCdf(waldStat, 1)).toPrecision(3)
      let likelihoodRatio = 2.0 * (cox.finalLogLikelihood - cox.initialLogLikelihood)
      let coxLogtest = (1.0 - ChiSquaredCdf(likelihoodRatio, 1)).toPrecision(3)
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
