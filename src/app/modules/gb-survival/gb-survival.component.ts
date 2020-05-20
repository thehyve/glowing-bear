import { Component, OnInit } from '@angular/core';

import {select,scaleLinear, scaleOrdinal, scaleBand, line, nest, curveStepBefore} from 'd3'
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { SurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';

@Component({
  selector: 'app-gb-survival',
  templateUrl: './gb-survival.component.html',
  styleUrls: ['./gb-survival.component.css']
})
export class GbSurvivalComponent implements OnInit {
  _clearRes :SurvivalAnalysisClear

  _curves:survivalCurve


  constructor() { }

  ngOnInit() {
  }

  buildLineChart(){
    var svg=select('#gb-survival-component').append("svg").append("g")
    var xaxis=scaleLinear().domain([0,10]).range([0,10])
    var yaxis=scaleLinear().domain([0,10]).range([10,0])

    var  colorSet=scaleOrdinal<string,string>().domain(retrieveGroupIds(this._clearRes)).range([
      "#ff4f4f",
      "#99f0dd",
      "fa8d2d",
      "5c67e6"
    ])

   

    var lineGen=line<{timePoint:number,prob:number,cumul:number,remaining:number}>()
    .x(d=>xaxis(d.timePoint))
    .y(d=>yaxis(d.prob))
    .curve(curveStepBefore)


    this._curves.curves.forEach(curve =>{
      svg.append("path").datum(curve.points).attr("fill","none")
      .attr("stroke",colorSet(curve.groupId)).attr("stroke-width",1)
      .attr("d",lineGen)
    })

   




  }



}
class survivalCurve{
  
  curves: Array<{
    groupId:string
    points:Array<{
    timePoint:number,
    prob:number,
    cumul:number,
    remaining:number
  }>}>

}


function clearResultsToArray(clearRes:  SurvivalAnalysisClear) :survivalCurve{
  var timePoints=clearRes.results[0].groupResults.map(groupRes=>groupRes.timepoint).sort()
  
  
  var curves =clearRes.results.map(result=>{
    let sortedByTimePoint=result.groupResults.sort((a,b)=>{
    return a.timepoint < b.timepoint ? -1:1;
  })

  var survivalState = new SurvivalState(result.initialCount)
  var points= sortedByTimePoint.map(oneTimePointRes=> survivalState.next(oneTimePointRes.timepoint,oneTimePointRes.events.eventOfInterest,oneTimePointRes.events.censoringEvent))
  return {groupId:result.groupId,
  points:points} 
  })

  var srva=new survivalCurve
  srva.curves=curves
  return srva

}


function survivalPoints(previousProb:number,previousCumul:number,timePoint:number,remainingTotal:number,currentEventOfInterest:number,currentCensoringEvent:number):{
  timePoint:number,
  prob:number,
  cumul:number,
  remaining:number
}{
  var ponctualProb=(remainingTotal-currentEventOfInterest)/(remainingTotal)
  var prob= ponctualProb*previousProb
  var cumul= previousCumul+currentEventOfInterest/(remainingTotal*(remainingTotal-currentEventOfInterest))
 return {
   timePoint:timePoint,
   prob:prob,
   cumul:cumul,
   remaining:remainingTotal-currentCensoringEvent
 }

}

class SurvivalState{
  _prob =1
  _cumul=0
  _remaining:number
  constructor(remaining:number){
    this._remaining=remaining
  }
  next(timePoint:number, eventOfInterest:number,censoring:number):{
    timePoint:number,
    prob:number,
    cumul:number,
    remaining:number
  }{
    var res=survivalPoints(this._prob,this._cumul, this._remaining,timePoint,eventOfInterest,censoring)
    this._prob=res.prob
    this._cumul=res.cumul
    this._remaining=res.remaining
    return res
  }

}

function retrieveGroupIds(clearRes:SurvivalAnalysisClear): Array<string>{
  return  clearRes.results.map(res=>res.groupId)

}


