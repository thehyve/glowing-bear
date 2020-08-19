/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CoxRegression, timePoint, eventType } from "./coxRegression"
import { breslowCoxRegression } from "./breslow"
import { efronCoxRegression } from "./efron"
import { SurvivalPoint } from "../survival-analysis/survival-curves"
export function NewCoxRegression(pointGroups:SurvivalPoint[][],maxIter: number, tolerance : number,method:string) : CoxRegression{
    
    if (pointGroups.length !=2){
        throw new Error(`For the moment, only two-group comparisons are implemented. Got ${pointGroups.length}`);
    }
    const data=prepare(pointGroups[0],pointGroups[1])
    if (method.toUpperCase()=="BRESLOW"){
        return new breslowCoxRegression(data,maxIter,tolerance)
    }else if (method.toUpperCase()=="EFRON"){
        return new efronCoxRegression(data,maxIter,tolerance)
    }else{
        throw new Error(`Unknown method ${method}. Only Breslow's and Efron's methods are implemented. Expected: one of "breslow" "efron"`);
    }
} 

function prepare(survivalPointsClass0 : SurvivalPoint[], survivalPointsClass1 : SurvivalPoint [] ): timePoint[]{

    var tmpArray = survivalPointsClass0.map(spoint => {return {time : spoint.timePoint,class:0,events:spoint.nofEvents,censorings:spoint.nofCensorings}}).concat(
    survivalPointsClass1.map(spoint => {return {time : spoint.timePoint,class:1,events:spoint.nofEvents,censorings:spoint.nofCensorings}}) )
    

    var tmpMap = new Map<number,eventType[]>()
    tmpArray.forEach(spoint =>{
            var events = new Array<eventType>()
        
            for (let i = 0; i < spoint.events; i++) {
                events.push({x:[spoint.class], event: true})

            }
            for (let i = 0; i < spoint.censorings; i++) {
                events.push({x:[spoint.class], event: false})
            
            }
            if(tmpMap.has(spoint.time)){
                tmpMap.set(spoint.time,tmpMap.get(spoint.time).concat(events))
                
            }else{
                tmpMap.set(spoint.time,events)
            }
        })
        var groupedTmpArray = new Array<timePoint>()
        tmpMap.forEach((value,key)=>{
            groupedTmpArray.push({time: key, events:value})
        })

        return groupedTmpArray.sort((a,b)=>a.time - b.time)
}

export function coxToString(coefficient:number,variance:number):string{
    const bilat95=1.96
    var sd= Math.sqrt(variance)
    var res= Math.exp(coefficient).toPrecision(3) + " ["
    res+=Math.exp(coefficient - bilat95*sd).toPrecision(3) +","
    res+=Math.exp(coefficient + bilat95 * sd).toPrecision(2) +"]"
    return res
}