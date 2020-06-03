import { Component, OnInit,OnChanges, Input, AfterViewInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';

import {select,scaleLinear, scaleOrdinal, scaleBand, line, nest, curveStepBefore, axisBottom,axisLeft} from 'd3'
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { SurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';


@Component({
  selector: 'app-gb-survival-res',
  templateUrl: './gb-survival.component.html',
  styleUrls: ['./gb-survival.component.css']
})
export class GbSurvivalComponent implements OnInit{

  _activated=false

  _cols=["Name","Value"]
  _values=[{name:"log-rank",value:0.9},{name:"p-val",value:0.85}]

  _ic=[{label:"none",value:null},{label:"identity",value:identity},{label:"log",value:logarithm},{label:"log -log",value:logarithmMinusLogarithm}]
  _selectedIc:  {label:string,value:(simga:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}) =>{inf:number,sup:number}}


  _grid=false
  _alphas=[{name:"90%",value:1.645},{name:"95%",value:1.960},{name:"99%",value:2.054}]
  _selectedAlpha:{name:string,value:number}
  




  constructor(private survivalService: SurvivalAnalysisServiceMock) { }

  @Input()
  set activated(bool:boolean){
    this._activated=bool  
  }

  get activated() : boolean{
    return this._activated
  }
  ngOnInit(){}
  /*

  ngAfterViewInit() {
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
*/

set cols(columns){
  this._cols=columns

}


get cols(){
  return this._cols
}

set values(val){
  this._values=val
}

get values(){
  return this._values
}

get ic(){
  return this._ic
}

set selectedIc(ic){
  this._selectedIc=ic
  console.log("selectedIc",this._selectedIc)
}

get selectedIc(){
  return this._selectedIc
}


set grid(val:boolean){
  this._grid =val

}

get grid():boolean{
  return this._grid
}

set selectedAlpha(num){
  this._selectedAlpha=num
  console.log("alpha",this._selectedAlpha)
}

get selectedAlpha(){
  return this._selectedAlpha
}

get alphas(){
  return this._alphas
}
  



}





// ---- confidence intervals


function identity(sigma:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}) :{inf:number,sup:number}{
  var limes= point.cumul * point.prob * point.prob
  console.log("limes",limes)
  return {inf: point.prob - sigma*limes, sup: point.prob + sigma*limes}
}

function logarithm(sigma:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}):{inf:number,sup:number}{
  var limes=point.cumul
  console.log("limes",limes)
  return {inf: point.prob*Math.exp( - sigma*limes), sup: point.prob *Math.exp( sigma*limes)}


}

function logarithmMinusLogarithm(sigma:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}):{inf:number,sup:number}{

  var limes = (point.prob ==0 || point.prob == 1) ? 0:point.cumul/(Math.pow(Math.log(point.prob),2))
  console.log("limes",limes)
  return {inf: Math.pow(point.prob , Math.exp(sigma*limes)), sup: Math.pow(point.prob, Math.exp(- sigma*limes))}


} 



