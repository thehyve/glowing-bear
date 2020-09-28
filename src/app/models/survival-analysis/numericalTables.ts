/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SurvivalPoint, ChiSquaredCdf } from "./survival-curves"
import { logRank2Groups } from "./logRankPvalue"
import { NewCoxRegression, coxToString } from "../cox-regression/coxModel"

export function numericalTables(curves: SurvivalPoint[][],maxIter:number =1000,tolerance:number=1e-14,stringPrecision:number=3):NumericalTablesType{
    const len=curves.length

    var groupLogrankTable=new Array<Array<string>>()
    var groupCoxRegTable= new Array<Array<string>>()
    var groupCoxWaldTable= new Array<Array<string>>()
    var groupCoxLogtestTable=new Array<Array<string>>()

    var groupTotalEvent=new Array<string>()
    var groupTotalCensoring=new Array<string>()
    var groupTotalAtRisk=new Array<string>()
    
    for (let i = 0; i < len; i++) {
        var logrankRow=new Array<string>()
        var coxRegRow= new  Array<string>()
        var waldCoxRow=new Array<string>()
        var coxLogtestRow = new Array<string>()
        var totalAtRisk :string
        var totalEvent :string
        var totalCensoring: string
        for (let j =0; j < len; j++) {
          var logrank =logRank2Groups(curves[i],curves[j]).toPrecision(stringPrecision)
          logrankRow.push(logrank)
          var cox=NewCoxRegression([curves[i],curves[j]],maxIter,tolerance,"breslow").run()
          var beta=cox.finalBeta[0]
          var variance= cox.finalCovarianceMatrixEstimate[0][0]
          var coxReg=coxToString(beta,variance)
          var  waldStat=Math.pow(beta,2)/(variance+ 1e-14)
          var waldTest=(1.0-ChiSquaredCdf(waldStat,1)).toPrecision(3)
          var likelihoodRatio= 2.0*(cox.finalLogLikelihood -cox.initialLogLikelihood)
          var coxLogtest=(1.0 -ChiSquaredCdf(likelihoodRatio,1)).toPrecision(3)
          console.log("loglikelihoodRatio",likelihoodRatio,"logtest pvalue",coxLogtest)
          coxRegRow.push(coxReg)
          waldCoxRow.push(waldTest)
          coxLogtestRow.push(coxLogtest)
         
        }
        totalAtRisk=curves[i][0].atRisk.toString()
        totalEvent=curves[i].map(p => p.nofEvents).reduce((a,b)=>a+b).toString()
        totalCensoring=curves[i].map(p => p.nofCensorings).reduce((a,b)=>a+b).toString()
        groupLogrankTable.push(logrankRow)
        groupCoxRegTable.push(coxRegRow)
        groupCoxWaldTable.push(waldCoxRow)
        groupCoxLogtestTable.push(coxLogtestRow)
        groupTotalEvent.push(totalEvent)
        groupTotalCensoring.push(totalCensoring)
        groupTotalAtRisk.push(totalAtRisk)
        
        }

        return {
            groupLogrankTable:groupLogrankTable,
            groupCoxRegTable:groupCoxRegTable,
            groupCoxWaldTable:groupCoxWaldTable,
            groupCoxLogtestTable:groupCoxLogtestTable,
            groupTotalEvent:groupTotalEvent,
            groupTotalCensoring:groupTotalCensoring,
            groupTotalAtRisk:groupTotalAtRisk
        }
}

export  type NumericalTablesType={
    groupLogrankTable:string[][],
    groupCoxRegTable:string[][],
    groupCoxWaldTable:string[][],
    groupCoxLogtestTable:string[][],
    groupTotalEvent:string[],
    groupTotalCensoring:string[],
    groupTotalAtRisk:string[]
}