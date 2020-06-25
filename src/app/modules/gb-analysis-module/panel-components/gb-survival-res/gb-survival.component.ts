/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';
import { SurvivalCurve, ChiSquaredCdf, SurvivalPoint, clearResultsToArray } from 'app/models/survival-analysis/survival-curves' 

import {SelectItem} from 'primeng/api'


@Component({
  selector: 'app-gb-survival-res',
  templateUrl: './gb-survival.component.html',
  styleUrls: ['./gb-survival.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class GbSurvivalComponent implements OnInit{
  colorRange=colorRange
  advancedSettings=false

  

  _activated=false

  _cols=["Name","Value"]
  _values=[{name:"log-rank",value:0.9},{name:"p-val",value:0.85}]

  _ic=[{label:"none",value:null},{label:"identity",value:identity},{label:"log",value:logarithm},{label:"log -log",value:logarithmMinusLogarithm},{label :"arcsine squared",value:arcsineSquaredRoot}]
  _selectedIc:  (simga:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}) =>{inf:number,sup:number}


  _grid=false
  _alphas=[{label:"90%",value:1.645},{label:"95%",value:1.960},{label:"99%",value:2.054}]
  _selectedAlpha:number
  _clearRes :SurvivalAnalysisClear


  _logRanks:Array<Array<number>>
  _survivalCurve:SurvivalCurve
  
  _formattedLogRanks:Array<Array<string>>

  _groupComparisons: SelectItem[]
  _selectedGroupComparison: {name1:string,name2:string, color1:string,color2:string,val:string}




  constructor(private survivalService: SurvivalAnalysisServiceMock) { }

  @Input()
  set activated(bool:boolean){
    this._activated=bool  
  }

  get activated() : boolean{
    return this._activated
  }
  ngOnInit(){
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._survivalCurve=clearResultsToArray(this._clearRes);
      //var km= new KaplanMeierEstimator(this._survivalCurve)
      this._logRanks=LogRank(this._survivalCurve)
      this._formattedLogRanks=LabelledLogRanks(this._logRanks,this._survivalCurve)
      this.setGroupComparisons()
    }).bind(this))


  }
  /*

  ngAfterViewInit() {
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
  }

  ngOnChanges(changes){

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
}

get selectedAlpha(){
  return this._selectedAlpha
}

get alphas(){
  return this._alphas
}
get formattedLogRanks() : Array<Array<string>>{
  return this._formattedLogRanks
}

get survivalCurve():SurvivalCurve{
  return this._survivalCurve
}


setGroupComparisons(){
  var len=this.survivalCurve.curves.length
  var curveName=this.survivalCurve.curves.map(curve=>curve.groupId)
  this._groupComparisons=new Array<SelectItem>()
  for (let i = 0; i < len; i++) {
    for (let j =i+1; j < len; j++) {
      this._groupComparisons.push({label:curveName[i]+curveName[j],value:{
        name1:curveName[i],
        name2:curveName[j],
        color1:colorRange[i],
        color2:colorRange[j],
        val: /*this._logRanks[i][j]*/(0.0013).toPrecision(3),
      }
    })
      
    }
    
  }

  if (len){
    this._selectedGroupComparison=this._groupComparisons[0].value
  }
}


get groupComparisons(){
  return this._groupComparisons
}

get selectedGroupComparison(){
  return this._selectedGroupComparison
}

set selectedGroupComparison(selGroup){
  this._selectedGroupComparison=selGroup
}
  



}





// ---- confidence intervals


function identity(sigma:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}) :{inf:number,sup:number}{
  var limes= point.cumul * point.prob * point.prob
  limes=Math.sqrt(limes)
  return {inf: point.prob - sigma*limes, sup: point.prob + sigma*limes}
}

function logarithm(sigma:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}):{inf:number,sup:number}{
  var limes=point.cumul
  limes=Math.sqrt(limes)
  return {inf: point.prob*Math.exp( - sigma*limes), sup: point.prob *Math.exp( sigma*limes)}


}

function logarithmMinusLogarithm(sigma:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}):{inf:number,sup:number}{

  var limes = (point.prob ==0 || point.prob == 1) ? 0:point.cumul/(Math.pow(Math.log(point.prob),2))
  limes=Math.sqrt(limes)
  return {inf: Math.pow(point.prob , Math.exp(sigma*limes)), sup: Math.pow(point.prob, Math.exp(- sigma*limes))}


}

function arcsineSquaredRoot(sigma:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}): {inf:number,sup:number}{
  var limes = (point.prob==1) ? 0: 0.25 * point.prob/(1-point.prob) *point.cumul
  var transformed=Math.asin(Math.sqrt(point.prob))
  limes = Math.sqrt(limes)
  return {inf: Math.pow(Math.sin(transformed - sigma * limes),2.0) , sup:Math.pow(Math.sin(transformed + sigma * limes),2.0)}
}






function LogRank(survival:SurvivalCurve):Array<Array<number>>{
  var len=survival.curves.length
  var res= new Array<Array<number>>(len)


  for (let i = 0; i < len; i++) {
    var resi = new Array<number>(len)
    for (let j = i+1; j < len; j++) {
      var ei : number= ChiEstimated(survival,j,i)
      var oi: number= ChiObserved(survival,i)
      var ej: number= ChiEstimated(survival,i,j)
      var oj: number= ChiObserved(survival,j)
      resi[j]=1-ChiSquaredCdf(Math.pow((ei-oi),2)/ei + Math.pow((ej-oj),2)/ej,len-1)



    }
    res[i]=resi


    
  }

  return res
}


class KaplanMeierEstimator{
  _real:SurvivalCurve
  _estimated = new Array<Map<number,number>>()
  constructor(surv:SurvivalCurve){
    

    var nofCurves=surv.curves.length
    var curves=surv.curves.map(curve=>curve.points)
    var curvesFinished = Array<boolean>()
    this._real=surv
    curves.forEach((()=>{
      this._estimated.push(new Map<number,number>())
      curvesFinished.push(false)
    }).bind(this))

    var indices=  Array<number>(nofCurves)
    while(curvesFinished.reduce((a,b)=> !(a &&b))){
      var argmin=-1
      var min=1000000
      for (let i = 0; i < nofCurves; i++) {
        if (curves[i][indices[i]].timePoint<min && !curvesFinished[i]){
          argmin=i
          min=curves[i][indices[i]].timePoint
        }
      for(let i = 0; i < nofCurves; i++){
        if (!curvesFinished[i]){
          this._estimated[i][min]=curves[i][indices[i]].prob
        }

      }

      indices[argmin]++
      curvesFinished[argmin]=(indices[argmin] >=curves[argmin].length)
        
        
      }


    }
  }

  get estimated(){
    return this.estimated
  }
  
}


function ChiEstimated(survivalCurve:SurvivalCurve,i:number,j:number):number{
  var ej=0
  for (let index = 0; index < survivalCurve.curves.length; index++) {
    var datumi =survivalCurve.curves[i].points[index]
    var datumj=survivalCurve.curves[j].points[index]
    ej+=datumi.nofEvents/datumi.remaining *datumj.remaining
    
  }
  return ej
}
function ChiObserved(survivalCurve:SurvivalCurve,j:number):number{

  var oj=0
  for (let index = 0; index < survivalCurve.curves.length; index++) {

    var datumj=survivalCurve.curves[j].points[index]
    oj+=datumj.nofEvents
    
  }
  return oj

}

function LabelledLogRanks(logranks:Array<Array<number>>,survivalCurve:SurvivalCurve):Array<Array<string>>{
  var len =logranks.length
  var res= new Array<Array<string>>(len)
  var firstLine=survivalCurve.curves.map(c=>c.groupId)
  firstLine.unshift("")
  res[0]=firstLine
  for (let i = 1; i < len; i++) {
    var otherLine=logranks[i-1].map(m=>m.toPrecision(3))
    otherLine.unshift(survivalCurve.curves[i-1].groupId)
    res[i]=otherLine
    
  }
  return res
}




function CoxRegression(survivalCurve){
  
}


export const colorRange=[
  "#ff4f4f",
  "#99f0dd",
  "#fa8d2d",
  "#5c67e6"
]



