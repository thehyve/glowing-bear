import { SurvivalAnalysisClear } from "./survival-analysis-clear";

import * as jstat from 'jstat'

export class SurvivalCurve{
  
    curves: Array<{
      groupId:string
      points:Array<SurvivalPoint>}>
  
  }

  export class SurvivalPoint{
    timePoint:number
    prob:number
    cumul:number
    remaining:number
    nofEvents:number
  nofCensorings:number
  }

export function ChiSquaredCdf(value:number, degreesOfFreedom:number):number{
    return jstat.chisquare.cdf(value,degreesOfFreedom)
}
  
export function clearResultsToArray(clearRes:  SurvivalAnalysisClear) :SurvivalCurve{
     
    var curves =clearRes.results.map(result=>{
      let sortedByTimePoint=result.groupResults.sort((a,b)=>{
      return a.timepoint < b.timepoint ? -1:1;
    })
  
    var survivalState = new SurvivalState(result.initialCount)
    var points= sortedByTimePoint.map(oneTimePointRes=> survivalState.next(oneTimePointRes.timepoint,oneTimePointRes.events.eventOfInterest,oneTimePointRes.events.censoringEvent))
    return {groupId:result.groupId,
    points:points} 
    })
  
    var srva=new SurvivalCurve
    srva.curves=curves
    return srva
  
  }
  
export function survivalPoints(previousProb:number,previousCumul:number,remainingTotal:number,timePoint:number,currentEventOfInterest:number,currentCensoringEvent:number): SurvivalPoint{
    var ponctualProb=(remainingTotal-currentEventOfInterest)/(remainingTotal)
    var prob= ponctualProb*previousProb
    var cumul= previousCumul+currentEventOfInterest/(remainingTotal*(remainingTotal-currentEventOfInterest))
   return {
     timePoint:timePoint,
     prob:prob,
     cumul:cumul,
     remaining:remainingTotal-currentCensoringEvent,
     nofEvents:currentEventOfInterest,
     nofCensorings:currentCensoringEvent

   }
  
  }
  
export class SurvivalState{
    _prob =1
    _cumul=0
    _remaining:number
    constructor(remaining:number){
      this._remaining=remaining
    }
    next(timePoint:number, eventOfInterest:number,censoring:number):SurvivalPoint{
      var res=survivalPoints(this._prob,this._cumul, this._remaining,timePoint,eventOfInterest,censoring)
      this._prob=res.prob
      this._cumul=res.cumul
      this._remaining=res.remaining

      return res
    }
  
  }
  
export function retrieveGroupIds(clearRes:SurvivalAnalysisClear): Array<string>{
    return  clearRes.results.map(res=>res.groupId)
  
  }



