/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { logLikelihood,derivative,secondDerivative,inMatrix,addTo,multiplyMatrixVector} from "./efron"
import {inv} from 'mathjs'




const EfronTestContext ={
    initialBeta:[0.0],
    initialTimePoints:[
        {time:1,events:[{x:[1],event:true},{x:[0],event:true},{x:[1],event:false},{x:[0],event:false}]},
        {time:2,events:[{x:[1],event:true},{x:[0],event:true}]},
 

    ]
}

export function TestEfron():void{
var hessian= new Array<Array<number>>(1)
hessian[0]= [0]
 var initLikelihood=logLikelihood(EfronTestContext.initialTimePoints,EfronTestContext.initialBeta)
 var initGradient=derivative(EfronTestContext.initialTimePoints,EfronTestContext.initialBeta)
 var initHessian=secondDerivative(EfronTestContext.initialTimePoints,EfronTestContext.initialBeta)
 inMatrix(hessian,initHessian)

 var likelihood=initLikelihood
 var gradient= initGradient
 var beta=EfronTestContext.initialBeta
 for (let i = 0; i < 10; i++) {
    var delta=multiplyMatrixVector(inv(hessian),gradient)
    addTo(beta,delta)

    likelihood=logLikelihood(EfronTestContext.initialTimePoints,beta)
    gradient=derivative(EfronTestContext.initialTimePoints,beta)
    inMatrix(hessian,secondDerivative(EfronTestContext.initialTimePoints,beta))



 }
}