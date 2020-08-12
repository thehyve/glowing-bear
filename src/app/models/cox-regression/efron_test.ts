/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { logLikelihood,derivative,secondDerivative,inMatrix} from "./efron"
import {matrix,inv} from 'mathjs'




const EfronTestContext ={
    initialBeta:[0.0],
    initialTimePoints:[
        {time:1,x:[1],event:true},
        {time:1,x:[1],event:false},
        {time:2,x:[1],event:true},
        {time:2,x:[0],event:false},
        {time:3,x:[0],event:true},
        {time:3,x:[0],event:false},
    ]
}

export function TestEfron():void{
var res= new Array<Array<number>>(1)
res[0]= [0]
 var initLikelihood=logLikelihood(EfronTestContext.initialTimePoints,EfronTestContext.initialBeta)
 var initGradient=derivative(EfronTestContext.initialTimePoints,EfronTestContext.initialBeta)
 var initHessian=secondDerivative(EfronTestContext.initialTimePoints,EfronTestContext.initialBeta)
 inMatrix(res,initHessian)
 console.log(initLikelihood,initGradient,inv(matrix(res)))
}