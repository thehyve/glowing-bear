/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import  {Matrix, matrix, inv,det, transpose,multiply, add,zeros,clone,subtract} from 'mathjs'
import { SurvivalPoint } from '../survival-analysis/survival-curves'

/**
 * Efron
 */

export function buildXtAugmented(groups: SurvivalPoint[][]): number[][]{
    
    var Xt = Array<Array<number>>()
    const nofGroups= groups.length
    groups.forEach(
        (group,i)=>{
            group.forEach((point=>{
                for(var e =0; e<point.nofEvents;e++){
                    
                    var event= new Array<number>(nofGroups+2)
                    
                    for(var j=0;j<event.length;j++){
                        event[j]=0.0
                    }
                    
                    event[i]=1.0
                    event[nofGroups]=point.timePoint
                    event[nofGroups +1]=1
                    Xt.push(event)
                }
                for(var e =0; e<point.nofCensorings;e++){
                    
                    var event= new Array<number>(nofGroups+2)
                    
                    for(var j=0;j<event.length;j++){
                        event[j]=0.0
                    }
                    
                    event[i]=1.0
                    event[nofGroups]=point.timePoint
                    event[nofGroups +1]=0
                    Xt.push(event)
                }
                
            }))
        }
    )
    Xt=Xt.sort((a,b)=>a[nofGroups] - b[nofGroups])
    return Xt
}

export function dichotomicAugmented(groups:SurvivalPoint[][]):number[][]{
    if (groups.length !=2){
        throw new Error(`this specific case needs exactly two groups. Provided ${groups.length}`)
    }

    var Xt=buildXtAugmented(groups)

    return Xt.map(x=>[x[0],x[2],x[3]])

}


export function buildThetas(Xt:number[][],beta:Array<number>):{
    negativeCumulTheta:Array<number>,
    negativeCumulThetaXt:Array<Array<number>>,
    negativeCumulThetXtXt:Array<Matrix>,
}{
    if(!beta.length){
        throw new Error("betas array is empty")
    }
    if(!Xt.length || Xt[0].length==0){
        throw new Error("X event matrix has 0 dimension ")
    }
    if(Xt[0].length-2 !=beta.length){
        throw new Error("the number of rows in X is not the number of betas")
    }
    const nofGroups= Xt[0].length -2
    const timePoints= Xt.map(x=>x[nofGroups])

    var theta =Xt.map(eventArray=>{
        var res=0.0
        for (let index = 0; index < beta.length; index++) {
            res+= beta[index] * eventArray[index]
        }
        return Math.exp(res)
    })


    var thetaMultiplyXt= new Array<Array<number>>()
    theta.forEach((theta,index)=>{
        var xNoTime=Xt[index].slice(0,nofGroups)
        
        var thetaX= xNoTime.map(x=>x*theta)
        thetaMultiplyXt.push(thetaX)
    })

    

    var thetaMultiplyXtXt = new Array<Matrix>()
    for(var t=0; t<timePoints.length;t++){
        var thetaXMatrix=transpose(matrix([thetaMultiplyXt[t]]))
        var xt =Xt[t].map(x=>x).splice(0,nofGroups)
        
        thetaMultiplyXtXt.push(multiply(thetaXMatrix,matrix([xt])))
    }


    var currentTheta=0.0
    var currentThetaXt=new Array<number>(nofGroups).fill(0.0)
    var currentThetaXtXt = zeros(nofGroups,nofGroups)
    var currentTimePoint=timePoints[timePoints.length-1]
    var lastPosition=timePoints.length
    var negativeCumulTheta= new Array<number>(timePoints.length)
    var negativeCumulThetaXt= new Array<Array<number>>(timePoints.length)
    var negativeCumulThetXtXt=new Array<Matrix>(timePoints.length)

    for(var i= timePoints.length-1;i>=0;i--){
        if(i==0 || timePoints[i] != currentTimePoint ){
            for(var j=i+1; j<lastPosition;j++){
                negativeCumulTheta[j]=currentTheta
                negativeCumulThetaXt[j]=currentThetaXt.map(x=>x)
                negativeCumulThetXtXt[j]=clone(currentThetaXtXt)
            }
            lastPosition=i+1
        }
        currentTheta+=theta[i]
        currentThetaXt=add(currentThetaXt,thetaMultiplyXt[i]) as number[]
        currentThetaXtXt=add(currentThetaXtXt,thetaMultiplyXtXt[i]) as Matrix
    }
    //last round
    for(var j=0; j<lastPosition;j++){
        negativeCumulTheta[j]=currentTheta
        negativeCumulThetaXt[j]=currentThetaXt.map(x=>x)
        negativeCumulThetXtXt[j]=clone(currentThetaXtXt)
    }
    

    return {
        negativeCumulTheta:negativeCumulTheta,
        negativeCumulThetaXt:negativeCumulThetaXt,
        negativeCumulThetXtXt:negativeCumulThetXtXt,
    }
}

export function logLikelihood(Xt: Array<Array<number>>,negativeCumulTheta: Array<number>,beta:Array<number>):number{
    var ll=0.0
    for(var t = 0; t<Xt.length;t++){
        if (Xt[t][beta.length+1] ==1){
            for(var i=0; i< beta.length;i++){
                ll+=beta[i]*Xt[t][i]
            }
            ll-=Math.log(negativeCumulTheta[t])
        }
    }
    return ll
}

export function gradientLogLikelihood(Xt: Array<Array<number>>,negativeCumulTheta: Array<number>,negativeCumulThetaXt: Array<Array<number>>,nofGroups:number): Array<number>{
    var gradient= new Array<number>(nofGroups).fill(0.0)
    for(var i =0 ; i <Xt.length;i++){
        if (Xt[i][nofGroups +1] ==1){
            var XtNoTime=Xt[i].map(x=>x).splice(0,nofGroups)
            gradient = add(gradient,XtNoTime) as number[]
            gradient =subtract(gradient,negativeCumulThetaXt[i].map(x=>x/negativeCumulTheta[i])) as number[]
        }
    }

    return gradient
}

export function hessianLogLikelihood(Xt: Array<Array<number>>,negativeCumulTheta: Array<number>, negativeCumulThetaXt : Array<Array<number>>,negativeCumulThetXtXt : Array<Matrix>,nofGroups: number):Matrix{
    //zeros not working else
    var hessian= new Array<Array<number>>(nofGroups)
    for(i=0;i<nofGroups;i++){
        hessian[i]=new Array<number>(nofGroups)
        for(j=0;j<nofGroups;j++){
            hessian[i][j]=0

        }
    }

    for(var t=0; t<negativeCumulTheta.length;t++){
        if(Xt[t][nofGroups +1]){
            for(var i=0; i<nofGroups;i++){
                for(var j=0; j<nofGroups;j++){
                    
                    var tmp=negativeCumulThetXtXt[t].toArray()  as number[][]
                    hessian[i][j] -= tmp[i][j]/negativeCumulTheta[t]
                    hessian[i][j] += negativeCumulThetaXt[t][i]*negativeCumulThetaXt[t][j] / Math.pow(negativeCumulTheta[t],2)


                }
            }
        }
    }


    return matrix(hessian)
}

export function testIt(){
    var variable=[[1,1],[1,-1]]
    var variable2=matrix(variable)
}