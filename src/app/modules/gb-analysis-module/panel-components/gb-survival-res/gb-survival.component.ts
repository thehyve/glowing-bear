import { Component, OnInit,OnChanges, Input, AfterViewInit, AfterViewChecked } from '@angular/core';

import {select,scaleLinear, scaleOrdinal, scaleBand, line, nest, curveStepBefore, axisBottom,axisLeft} from 'd3'
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { SurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';

@Component({
  selector: 'app-gb-survival-res',
  templateUrl: './gb-survival.component.html',
  styleUrls: ['./gb-survival.component.css']
})
export class GbSurvivalComponent implements OnInit,OnChanges{
  _clearRes :SurvivalAnalysisClear

  _curves:survivalCurve
  _activated=false


  constructor(private survivalService: SurvivalAnalysisServiceMock) { }

  @Input()
  set activated(bool:boolean){
    this._activated=bool
  }

  get activated() : boolean{
    return this._activated
  }

  ngOnInit() {
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
  }

  ngOnChanges(changes){

    console.log("I've changed",this._activated)
    console.log("executing")
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
    console.log("executed")
  }

  buildLineChart(){
    var width =500
    var height=500
    var margins=10
    var svg=select('#gb-survival-component').append("svg").attr("width",width+2*margins)
    .attr("height",height +2*margins)
    .append("g").attr("transform",`translate (${margins},${margins})`)
    var xaxis=scaleLinear().domain([0,10]).range([0,height])
    var yaxis=scaleLinear().domain([0,1]).range([width,0])

    svg.append("g").attr("transform",`translate(${2*margins},${height-margins})`).call(axisBottom(xaxis))

    svg.append("g").attr("transform", `translate(${margins},${margins})`).call(axisLeft(yaxis))

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


function survivalPoints(previousProb:number,previousCumul:number,remainingTotal:number,timePoint:number,currentEventOfInterest:number,currentCensoringEvent:number):{
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


