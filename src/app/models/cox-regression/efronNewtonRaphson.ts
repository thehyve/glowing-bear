/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { prepareEfron,logLikelihood,derivative,secondDerivative,inMatrix,addTo,multiplyMatrixVector} from "./efron"
import {inv} from 'mathjs'
import {  SurvivalPoint } from "../survival-analysis/survival-curves"


export function efronNewtonRaphson(maxIter: number, convergenceCriterion:number, survivalCurves: SurvivalPoint[][], initialBeta : Array<number>):{
    initialLogLikelihood:number,
    finalLogLikelihood:number,
    finalBeta:number [],
    finalCovarianceMatrixEstimate:number[][],
    status:string,
}
{
    if(convergenceCriterion<=0){
        throw new Error("Negative convergence criterion");
        
    }
    if (survivalCurves.length -1 != initialBeta.length ){
        throw new Error(`From group comparison, the length of beta must be equal to the number of groups minus 1. Expected ${survivalCurves.length-1} ,got ${beta.length}`)
    }
    if (survivalCurves.length != 2){
        throw new Error(`The comparison for more than two groups coming from the SurvivaCurve objects is not yet implemented. Expected 2, got ${survivalCurves.length}`);
    }

    

    const efronTimePoints =prepareEfron(survivalCurves[0],survivalCurves[1])


    var beta = initialBeta.map(x=>x)

    var initialLogLikelihood=logLikelihood(efronTimePoints,beta)
    var lLikelihood=logLikelihood(efronTimePoints,beta)
    var previouslogLikelihood=initialLogLikelihood
    
    var hessian= new Array<Array<number>>(beta.length)
    var gradient = new Array<number>(beta.length)
    for (let i = 0; i < beta.length; i++) {
        gradient[i]=0.0
        hessian[i]= new Array<number>(beta.length)
        for (let j = 0; j < beta.length; j++) {
            hessian[i][j] = 0.0; 
        } 
        
    }
    var status ="finished before reaching the convergence criterion"
        
    for (let i = 0; i < maxIter; i++) {
        
        

        
        gradient=derivative(efronTimePoints,beta)
        inMatrix(hessian,secondDerivative(efronTimePoints,beta))
        
        var delta=multiplyMatrixVector(inv(hessian),gradient)
        addTo(beta,delta)
        lLikelihood=logLikelihood(efronTimePoints,beta)
        if (((previouslogLikelihood-lLikelihood)/lLikelihood) < convergenceCriterion  ){
            status =""
            break
        }
        previouslogLikelihood=lLikelihood
        
        
    }
    inMatrix(hessian,secondDerivative(efronTimePoints,beta))
    return {
        initialLogLikelihood:initialLogLikelihood,
        finalLogLikelihood:lLikelihood,
        finalBeta:beta,
        finalCovarianceMatrixEstimate:inv(hessian),
        status:status,
    }
}