/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import  {Matrix, matrix, inv,det, transpose,multiply, add,zeros,clone,subtract, reshape, exp, log} from 'mathjs'
import { SurvivalPoint } from '../survival-analysis/survival-curves'

/**
 * Efron
 */
export type timePoint = {time: number, x: number[],event: boolean}

// validate checks whether the the timepoints have the same dimension and returns this dimension, -1 otherwise
function validate(timePoints :timePoint[]): number{
    return timePoints.map( tp => tp.x.length).reduce((a,b)=>(a ==b)?a:-1)
}

function scalarProduct(x:number[],y:number[]):number{
    var res = x[0]*y[0]
    for (let i =1; i < x.length; i++) {
        res +=x[i]*y[i];
        
    }
    return res
}

function addVec(x:number[],y:number []):number[]{
    var res = new Array<number>(x.length)
    for (let i =0; i < x.length; i++) {
        res[i]=x[i]+y[i];
        
    }
    return res
}

function multiplyByScalar(alpha: number, x: number[]):number[]{
    return x.map(y=>alpha*y)

}

function reset(x: number[]){
    for (let i =0; i < x.length; i++) {
        x[i]=0
        
    }
}

export function addTo(x:number[],y:number []){
    for (let i =0; i < x.length; i++) {
        x[i]+=y[i]
        
    }
}

function externalProduct(res:number[],x:number[],y: number[]){
 
    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            res[i*y.length +j] =x[i]*y[j] 
            
        }
        
    }

}

export function inMatrix(target : number[][], flatVector : number []){

    for (let i = 0; i < target.length; i++) {
        for (let j = 0; j < target[i].length; j++) {
            target[i][j]= flatVector[i*target[i].length + j]
            
        }
        
    }

}
export function multiplyMatrixVector(matrix: number[][],vector : number[]): number[]{
    var res=new Array<number>(matrix.length)

    for (let i = 0; i < matrix.length; i++) {
        res[i]=0
        for (let j = 0; j < vector.length; j++) {
            res[i] += matrix[i][j] * vector[j]
            
        }
        
    }

    return res
}

//after validation
export function logLikelihood(timePoints:timePoint[],beta: number[]):number{
    var res =0
    var k=0
    var a =0
    var b=0
    var c=0
    var d=0
    var currentTime =0
    var scal =0
    console.log("BBEETTAA",beta)
    for (let i = 0; i < timePoints.length; i++) {
        k=0
        a=0
        b=0
        c=0
        d=0
        currentTime=timePoints[i].time
        for (let j = i;   j <timePoints.length; j++) {
            if(timePoints[j].time!=currentTime){
                break
            }
            
            if (timePoints[j].event){
                console.log("time points x",timePoints[j].x)
                console.log("beta",beta)
                scal=scalarProduct(timePoints[j].x,beta)
                console.log("scalar product", scal)
                a+=scal
                console.log("a",a)
                c+=exp(scal)
                console.log("c",c)
            }
            k+=1
        }


        for (let j = i; j < timePoints.length; j++) {
            b+=exp(scalarProduct(timePoints[j].x,beta))
            
        }

        for (let n = 0; n < k; n++) {
            d+=log(b- n/k * c)
        }
        console.log("d",d)
        res+=a-d
    }

    return res
}

export function derivative(timePoints:timePoint[],beta: number[]):number[]{
    var e=beta.map(x=>0.0)
    var f=beta.map(x=>0.0)
    var g=beta.map(x=>0.0)
    var h=beta.map(x=>0.0)
    var res=beta.map(x=> 0.0)
    var b =0.0
    var c = 0.0
    var k=0


    var expo=0
    var currentTime=0
    for (let i = 0; i < timePoints.length; i++) {
        reset(e)
        reset(f)
        reset(g)
        reset(h)
        b=0.0
        c=0.0
        k=0


        currentTime=timePoints[i].time
        for (let j = i;j <timePoints.length; j++) {
            if(timePoints[j].time!=currentTime){
                break
            }
            
            if (timePoints[j].event){
                expo=exp(scalarProduct(timePoints[j].x,beta))
                c+=expo
                addTo(h,timePoints[j].x)
                addTo(f,multiplyByScalar(expo,timePoints[j].x))
            }
            k+=1
        }




        for(let j = i; j <timePoints.length; j++){
            expo=exp(scalarProduct(timePoints[j].x,beta))
            addTo(e,multiplyByScalar(expo,timePoints[j].x))
            b+=expo
        }

        for (let n = 0; n < k; n++) {
            addTo(g,multiplyByScalar(
                1.0/(b- n/k *c),
                addVec(e,multiplyByScalar(
                    -n/k,
                    f
                ))))
        }

        addTo(res,addVec(h,multiplyByScalar(-1.0,g)))
        
    }
    return res
}

export function secondDerivative(timePoints:timePoint[],beta: number[]):number[]{
    var p = new Array<number>(beta.length*beta.length)
    var q = new Array<number>(beta.length*beta.length)
    var e = new Array<number>(beta.length)
    var f = new Array<number>(beta.length)
    var u = new Array<number>(beta.length)
    var uut = new Array<number>(beta.length*beta.length)
    var res = new Array<number>(beta.length*beta.length)
    reset(uut)
    reset(res)
    var xxt = new Array<number>(beta.length*beta.length)
    reset(xxt)
    var b=0.0
    var c=0.0
    var k=0
    var expo=0.0
    var r=0.0
    var currentTime=0.0

    for (let i = 0; i < timePoints.length; i++){
        reset(p)
        reset(q)
        reset(e)
        reset(f)
        reset(u)
        
        b=0.0
        c=0.0
        k=0
        currentTime=timePoints[i].time
        for (let j = i; j <timePoints.length; j++) {
            if(timePoints[j].time!=currentTime){
                break
            }
            
            if (timePoints[j].event){
                expo=exp(scalarProduct(timePoints[j].x,beta))
                externalProduct(xxt,timePoints[j].x,multiplyByScalar(expo,timePoints[j].x))
                addTo(q,xxt)
                c+=expo
                addTo(f,multiplyByScalar(expo,timePoints[j].x))
            }
            k+=1
        }

        for(let j = i; j <timePoints.length; j++){
            expo=exp(scalarProduct(timePoints[j].x,beta))
            externalProduct(xxt,timePoints[j].x,multiplyByScalar(expo,timePoints[j].x))
            addTo(p,xxt)
            addTo(e,multiplyByScalar(expo,timePoints[j].x))
            b+=expo
        }
        for (let n = 0; n < k; n++){
            r=b- n/k *c

            u=addVec(e, multiplyByScalar(-n/k,f))
            externalProduct(uut,u,u)

            
            multiplyByScalar(1.0/r,addVec(p,multiplyByScalar(-n/k,q)))
            
            multiplyByScalar(-1.0/(r*r),uut)

            addTo(res,multiplyByScalar(1.0/r,addVec(p,multiplyByScalar(-n/k,q))))
            addTo(res,multiplyByScalar(-1.0/(r*r),uut))
        }
    }
return res
}

export function prepareEfron(survivalPointsClass0 : SurvivalPoint[], survivalPointsClass1 : SurvivalPoint [] ): timePoint[]{

    var tmpArray = survivalPointsClass0.map(spoint => {return {time : spoint.timePoint,class:0,events:spoint.nofEvents,censorings:spoint.nofCensorings}}).concat(
    survivalPointsClass1.map(spoint => {return {time : spoint.timePoint,class:1,events:spoint.nofEvents,censorings:spoint.nofCensorings}}) )
    tmpArray = tmpArray.sort(spoint =>spoint.time)

    return tmpArray.map(spoint=>{
        var res = new Array<timePoint>()
        for (let i = 0; i < spoint.events; i++) {
            res.push({time:spoint.time,x : [spoint.class],event:true})   
        }
        for (let i = 0; i < spoint.censorings; i++) {
            res.push({time:spoint.time,x : [spoint.class],event:false})   
        }

        return res
    }).reduce((a,b)=> a.concat(b))
}