/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SurvivalPoint, } from "../survival-analysis/survival-curves";
import { buildThetas, gradientLogLikelihood,hessianLogLikelihood,logLikelihood, dichotomicAugmented } from "./coxModel";
import  {Matrix, matrix, inv, transpose,multiply, subtract,squeeze} from 'mathjs'

export function breslowNewtonRaphson(maxIter: number, convergenceCriterion:number, survivalCurves: SurvivalPoint[][], initialBeta : Array<number>):{
    initialLogLikelihood:number,
    finalLogLikelihood:number,
    finalBeta:number [],
    finalCovarianceMatrixEstimate:number[][],
    status:string,
}{
    if (convergenceCriterion <=0){
        throw new Error("null or negative tolerance")
    }

    if( survivalCurves.length != 2){
        throw new Error("For the moment, the implementation is aimed at dichotomic variable, the number of group must be 2. Provided "+survivalCurves.length)
    }
    if( initialBeta.length !=1){
        throw new Error("For the moment, the implementation is aimed at dichotomic variable, the number of group initial parameters must be 1. Provided "+initialBeta.length)

    }
    const nofGroups=initialBeta.length
    
    var epsilon=convergenceCriterion+1
    var previousLikelihood=0.0
    var initialLogLikelihood:number
    var likelihood:number
    var Xt=dichotomicAugmented(survivalCurves)
    
    var beta=initialBeta.map(x=>x)

    var hessian : Matrix
    var tmp
    for(var i =0; i<maxIter;i++){
        if (epsilon < convergenceCriterion){
            break
        }
        
        if (i==0){
            tmp=buildThetas(Xt,beta)
            previousLikelihood=logLikelihood(Xt,tmp.negativeCumulTheta,beta)
            initialLogLikelihood=previousLikelihood
        }
        var gradient=gradientLogLikelihood(Xt,tmp.negativeCumulTheta,tmp.negativeCumulThetaXt,nofGroups)

        hessian=hessianLogLikelihood(Xt,tmp.negativeCumulTheta,tmp.negativeCumulThetaXt,tmp.negativeCumulThetXtXt,nofGroups)

        
        
        var delta= multiply(inv(hessian),transpose(matrix([gradient])))
        
        
        beta= subtract(beta,squeeze(delta)) as number[]
        tmp=buildThetas(Xt,beta)

        likelihood=logLikelihood(Xt,tmp.negativeCumulTheta,beta)
        epsilon=(previousLikelihood-likelihood)/likelihood

        previousLikelihood=likelihood

    }

    var status= (epsilon>= convergenceCriterion) ? `max number of iterations ${maxIter} reached before convergence criterion`:null
    var covarianceMatrix= (hessian) ?inv(hessian).toArray() as number[][]:null
    return {
        initialLogLikelihood:initialLogLikelihood,
        finalLogLikelihood:likelihood,
        finalBeta:beta,
        finalCovarianceMatrixEstimate:covarianceMatrix,
        status:status
    }  
}

export function coxToString(coefficient:number,variance:number):string{
    const bilat95=1.96
    var sd= Math.sqrt(variance)
    var res= Math.exp(coefficient).toPrecision(3) + " ["
    res+=Math.exp(coefficient - bilat95*sd).toPrecision(3) +","
    res+=Math.exp(coefficient + bilat95 * sd).toPrecision(2) +"]"
    return res
}


//beta should be 0.9406
export const newtonRaphsonTest:Array<Array<SurvivalPoint>>=[
    [
        {
            timePoint:1,
            prob:0,
            cumul:0,
            cumulCensorings:0,
            cumulEvents:0,
            remaining:1,
            atRisk: 3   , //at risk at instant t, it is equivalent to remaining +censorings +events
            nofEvents:1,
          nofCensorings:0,
          },{
            timePoint:3,
            prob:0,
            cumul:0,
            cumulCensorings:0,
            cumulEvents:0,
            remaining:0,
            atRisk: 2, //at risk at instant t, it is equivalent to remaining +censorings +events
            nofEvents:1,
          nofCensorings:0,
          }

    ],[{
        timePoint:1,
        prob:0,
        cumul:0,
        cumulCensorings:0,
        cumulEvents:0,
        remaining:1,
        atRisk: 2, //at risk at instant t, it is equivalent to remaining +censorings +events
        nofEvents:1,
      nofCensorings:0,
      },{
        timePoint:3,
        prob:0,
        cumul:0,
        cumulCensorings:0,
        cumulEvents:0,
        remaining:0,
        atRisk: 1, //at risk at instant t, it is equivalent to remaining +censorings +events
        nofEvents:1,
      nofCensorings:0,
      }

    ]

]